package store

import (
	"context"
	"moondust/src/v2/chat"
	"time"
)

type ChatEvent struct {
	ID       string
	ThreadID string

	Event chat.RawEvent

	CreatedAt time.Time
}

type ChatEventStore interface {
	Store[ChatEvent]

	ListByThread(ctx context.Context, threadID []byte) ([]*ChatEvent, error)
}
