//go:build !windows

package terminal

import (
	"context"
	"encoding/json"
	"log/slog"
	"os"
	"os/exec"

	"github.com/coder/websocket"
	"github.com/creack/pty/v2"
)

type resizeMsg struct {
	Type string `json:"type"`
	Rows uint16 `json:"rows"`
	Cols uint16 `json:"cols"`
}

func runTerminalSession(ctx context.Context, c *websocket.Conn) {
	cmd := shellCommand()
	cmd.Env = append(os.Environ(), "TERM=xterm-256color")

	ws := &pty.Winsize{Rows: 24, Cols: 80}
	ptm, err := pty.StartWithSize(cmd, ws)
	if err != nil {
		slog.Error("terminal: start pty", "error", err)
		return
	}
	defer func() { _ = ptm.Close() }()

	done := make(chan struct{})
	go func() {
		defer close(done)
		pumpPTYToWS(ctx, c, ptm)
	}()

	pumpWSToPTY(ctx, c, ptm, ws)

	_ = cmd.Process.Kill()
	<-done
	_ = cmd.Wait()
}

func pumpPTYToWS(ctx context.Context, c *websocket.Conn, ptm *os.File) {
	buf := make([]byte, 32*1024)
	for {
		n, err := ptm.Read(buf)
		if err != nil {
			return
		}
		if n == 0 {
			continue
		}
		if err := c.Write(ctx, websocket.MessageBinary, buf[:n]); err != nil {
			return
		}
	}
}

func pumpWSToPTY(ctx context.Context, c *websocket.Conn, ptm *os.File, ws *pty.Winsize) {
	for {
		typ, data, err := c.Read(ctx)
		if err != nil {
			return
		}
		switch typ {
		case websocket.MessageBinary:
			if _, err := ptm.Write(data); err != nil {
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
			ws.Rows = m.Rows
			ws.Cols = m.Cols
			if err := pty.Setsize(ptm, ws); err != nil {
				slog.Debug("terminal: resize", "error", err)
			}
		}
	}
}

func shellCommand() *exec.Cmd {
	sh := os.Getenv("SHELL")
	if sh == "" {
		sh = "/bin/bash"
	}
	return exec.Command(sh, "-i")
}
