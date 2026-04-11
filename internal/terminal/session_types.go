package terminal

import (
	"context"

	"github.com/coder/websocket"
)

type wsConn interface {
	Read(ctx context.Context) (websocket.MessageType, []byte, error)
	Write(ctx context.Context, typ websocket.MessageType, p []byte) error
}

type managedSession interface {
	Attach(ctx context.Context, c wsConn)
	Close() error
}
