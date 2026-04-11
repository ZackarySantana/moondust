//go:build windows

package terminal

import (
	"context"

	"github.com/coder/websocket"
)

type windowsSession struct{}

func newManagedSession(cwd string) (managedSession, error) {
	return &windowsSession{}, nil
}

func (s *windowsSession) Attach(ctx context.Context, c wsConn) {
	msg := []byte("Embedded terminal is not supported on Windows in this build.\r\n")
	_ = c.Write(ctx, websocket.MessageBinary, msg)
}

func (s *windowsSession) Close() error {
	return nil
}
