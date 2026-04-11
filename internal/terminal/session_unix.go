//go:build !windows

package terminal

import (
	"context"
	"encoding/json"
	"log/slog"
	"os"
	"os/exec"
	"sync"

	"github.com/coder/websocket"
	"github.com/creack/pty/v2"
)

type resizeMsg struct {
	Type string `json:"type"`
	Rows uint16 `json:"rows"`
	Cols uint16 `json:"cols"`
}

type unixSession struct {
	cmd *exec.Cmd
	ptm *os.File
	ws  *pty.Winsize

	mu          sync.Mutex
	subscribers map[int]chan []byte
	nextSubID   int
	closed      bool
	closeOnce   sync.Once
}

func newManagedSession(cwd string) (managedSession, error) {
	cmd := shellCommand()
	cmd.Env = append(os.Environ(), "TERM=xterm-256color")
	if cwd != "" {
		if info, err := os.Stat(cwd); err == nil && info.IsDir() {
			cmd.Dir = cwd
		} else {
			slog.Warn("terminal: invalid working directory", "cwd", cwd, "error", err)
		}
	}

	ws := &pty.Winsize{Rows: 24, Cols: 80}
	ptm, err := pty.StartWithSize(cmd, ws)
	if err != nil {
		return nil, err
	}

	sess := &unixSession{
		cmd:         cmd,
		ptm:         ptm,
		ws:          ws,
		subscribers: map[int]chan []byte{},
	}
	go sess.pumpPTY()
	return sess, nil
}

func (s *unixSession) Attach(ctx context.Context, c wsConn) {
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

func (s *unixSession) Close() error {
	var closeErr error
	s.closeOnce.Do(func() {
		s.mu.Lock()
		s.closed = true
		for _, ch := range s.subscribers {
			close(ch)
		}
		s.subscribers = map[int]chan []byte{}
		s.mu.Unlock()

		if s.ptm != nil {
			_ = s.ptm.Close()
		}
		if s.cmd != nil && s.cmd.Process != nil {
			_ = s.cmd.Process.Kill()
			if err := s.cmd.Wait(); err != nil {
				closeErr = err
			}
		}
	})
	return closeErr
}

func (s *unixSession) pumpPTY() {
	buf := make([]byte, 32*1024)
	for {
		n, err := s.ptm.Read(buf)
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

func (s *unixSession) readClient(ctx context.Context, c wsConn) {
	for {
		typ, data, err := c.Read(ctx)
		if err != nil {
			return
		}
		switch typ {
		case websocket.MessageBinary:
			if _, err := s.ptm.Write(data); err != nil {
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
			s.ws.Rows = m.Rows
			s.ws.Cols = m.Cols
			if err := pty.Setsize(s.ptm, s.ws); err != nil {
				slog.Debug("terminal: resize", "error", err)
			}
		}
	}
}

func (s *unixSession) subscribe() (int, chan []byte) {
	s.mu.Lock()
	defer s.mu.Unlock()
	id := s.nextSubID
	s.nextSubID++
	ch := make(chan []byte, 128)
	s.subscribers[id] = ch
	return id, ch
}

func (s *unixSession) unsubscribe(id int) {
	s.mu.Lock()
	defer s.mu.Unlock()
	ch, ok := s.subscribers[id]
	if !ok {
		return
	}
	delete(s.subscribers, id)
	close(ch)
}

func shellCommand() *exec.Cmd {
	sh := os.Getenv("SHELL")
	if sh == "" {
		sh = "/bin/bash"
	}
	return exec.Command(sh, "-i")
}
