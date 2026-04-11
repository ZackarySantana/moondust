package terminal

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net"
	"net/http"
	"time"
)

type Server struct {
	token    string
	listener net.Listener
	srv      *http.Server
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
	shCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	err := s.srv.Shutdown(shCtx)
	if s.listener != nil {
		_ = s.listener.Close()
	}
	return err
}
