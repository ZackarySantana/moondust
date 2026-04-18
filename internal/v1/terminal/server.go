package terminal

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net"
	"net/http"
	"sync"
	"time"
)

type Server struct {
	token    string
	listener net.Listener
	srv      *http.Server
	mu       sync.Mutex
	sessions map[string]managedSession
}

func New() (*Server, error) {
	tokenBytes := make([]byte, 16)
	if _, err := rand.Read(tokenBytes); err != nil {
		return nil, fmt.Errorf("random token: %w", err)
	}
	token := hex.EncodeToString(tokenBytes)

	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, fmt.Errorf("listen: %w", err)
	}

	mux := http.NewServeMux()
	s := &Server{
		token:    token,
		listener: ln,
		sessions: map[string]managedSession{},
	}
	mux.HandleFunc("/terminal", s.handleTerminal)

	s.srv = &http.Server{
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 0,
	}

	go func() {
		_ = s.srv.Serve(ln)
	}()

	return s, nil
}

func (s *Server) URL() string {
	host := s.listener.Addr().String()
	return fmt.Sprintf("ws://%s/terminal?token=%s", host, s.token)
}

func (s *Server) Shutdown(ctx context.Context) error {
	if s.srv == nil {
		return nil
	}
	s.mu.Lock()
	sessions := make([]managedSession, 0, len(s.sessions))
	for _, sess := range s.sessions {
		sessions = append(sessions, sess)
	}
	s.mu.Unlock()
	for _, sess := range sessions {
		_ = sess.Close()
	}

	shCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	err := s.srv.Shutdown(shCtx)
	if s.listener != nil {
		_ = s.listener.Close()
	}
	return err
}

func (s *Server) attach(ctx context.Context, c wsConn, sessionID, cwd string) {
	sess, err := s.getOrCreateSession(sessionID, cwd)
	if err != nil {
		return
	}
	sess.Attach(ctx, c)
}

func (s *Server) getOrCreateSession(sessionID, cwd string) (managedSession, error) {
	s.mu.Lock()
	existing := s.sessions[sessionID]
	s.mu.Unlock()
	if existing != nil {
		return existing, nil
	}

	created, err := newManagedSession(cwd)
	if err != nil {
		return nil, err
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	if existing = s.sessions[sessionID]; existing != nil {
		_ = created.Close()
		return existing, nil
	}
	s.sessions[sessionID] = created
	return created, nil
}
