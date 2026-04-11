//go:build windows

package terminal

import (
	"context"
	"encoding/json"
	"log/slog"
	"os"
	"sync"

	"github.com/UserExistsError/conpty"
	"github.com/coder/websocket"
)

type resizeMsg struct {
	Type string `json:"type"`
	Rows uint16 `json:"rows"`
	Cols uint16 `json:"cols"`
}

type windowsSession struct {
	cpty *conpty.ConPty

	mu          sync.Mutex
	subscribers map[int]chan []byte
	nextSubID   int
	closed      bool
	closeOnce   sync.Once
}

func newManagedSession(cwd string) (managedSession, error) {
	shell := os.Getenv("COMSPEC")
	if shell == "" {
		shell = "cmd.exe"
	}

	opts := []conpty.ConPtyOption{
		conpty.ConPtyDimensions(80, 24),
	}
	if cwd != "" {
		if info, err := os.Stat(cwd); err == nil && info.IsDir() {
			opts = append(opts, conpty.ConPtyWorkDir(cwd))
		} else {
			slog.Warn("terminal: invalid working directory", "cwd", cwd, "error", err)
		}
	}

	cpty, err := conpty.Start(shell, opts...)
	if err != nil {
		return nil, err
	}

	sess := &windowsSession{
		cpty:        cpty,
		subscribers: map[int]chan []byte{},
	}
	go sess.pumpOutput()
	return sess, nil
}

func (s *windowsSession) Attach(ctx context.Context, c wsConn) {
	subID, ch := s.subscribe()
	defer s.unsubscribe(subID)

	done := make(chan struct{})
	go func() {
		defer close(done)
		s.readClient(ctx, c)
	}()

	for {
		select {
		case <-ctx.Done():
			return
		case <-done:
			return
		case data, ok := <-ch:
			if !ok {
				return
			}
			if err := c.Write(ctx, websocket.MessageBinary, data); err != nil {
				return
			}
		}
	}
}

func (s *windowsSession) Close() error {
	s.closeOnce.Do(func() {
		s.mu.Lock()
		s.closed = true
		for _, ch := range s.subscribers {
			close(ch)
		}
		s.subscribers = map[int]chan []byte{}
		s.mu.Unlock()

		if s.cpty != nil {
			_ = s.cpty.Close()
		}
	})
	return nil
}

func (s *windowsSession) pumpOutput() {
	buf := make([]byte, 32*1024)
	for {
		n, err := s.cpty.Read(buf)
		if err != nil {
			_ = s.Close()
			return
		}
		if n == 0 {
			continue
		}

		chunk := make([]byte, n)
		copy(chunk, buf[:n])

		s.mu.Lock()
		for _, sub := range s.subscribers {
			select {
			case sub <- chunk:
			default:
			}
		}
		s.mu.Unlock()
	}
}

func (s *windowsSession) readClient(ctx context.Context, c wsConn) {
	for {
		typ, data, err := c.Read(ctx)
		if err != nil {
			return
		}
		switch typ {
		case websocket.MessageBinary:
			if _, err := s.cpty.Write(data); err != nil {
				return
			}
		case websocket.MessageText:
			var m resizeMsg
			if json.Unmarshal(data, &m) != nil || m.Type != "resize" {
				continue
			}
			if m.Rows == 0 || m.Cols == 0 {
				continue
			}
			if err := s.cpty.Resize(int(m.Cols), int(m.Rows)); err != nil {
				slog.Debug("terminal: resize", "error", err)
			}
		}
	}
}

func (s *windowsSession) subscribe() (int, chan []byte) {
	s.mu.Lock()
	defer s.mu.Unlock()
	id := s.nextSubID
	s.nextSubID++
	ch := make(chan []byte, 128)
	s.subscribers[id] = ch
	return id, ch
}

func (s *windowsSession) unsubscribe(id int) {
	s.mu.Lock()
	defer s.mu.Unlock()
	ch, ok := s.subscribers[id]
	if !ok {
		return
	}
	delete(s.subscribers, id)
	close(ch)
}
