//go:build windows

package terminal

import (
	"context"

	"github.com/coder/websocket"
)

func runTerminalSession(ctx context.Context, c *websocket.Conn) {
	msg := []byte("Embedded terminal is not supported on Windows in this build.\r\n")
	_ = c.Write(ctx, websocket.MessageBinary, msg)
}
