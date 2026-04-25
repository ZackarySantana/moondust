package policy

import (
	"context"
	"errors"
	"moondust/internal/v2/store"
	"time"
)

var _ store.ChatEventStore = (*ChatEventStore)(nil)

type ChatEventStore struct {
	store store.ChatEventStore
}

func WrapChatEvent(store store.ChatEventStore) *ChatEventStore {
	return &ChatEventStore{store}
}

func (t *ChatEventStore) Get(ctx context.Context, id []byte) (*store.ChatEvent, error) {
	return t.store.Get(ctx, id)
}

func (t *ChatEventStore) Put(ctx context.Context, id []byte, data *store.ChatEvent) error {
	data.CreatedAt = time.Now()
	return t.store.Put(ctx, id, data)
}

func (t *ChatEventStore) List(ctx context.Context) ([]*store.ChatEvent, error) {
	return t.store.List(ctx)
}

func (t *ChatEventStore) Update(ctx context.Context, id []byte, data *store.ChatEvent) error {
	return errors.New("Chat events are immutable")
}

func (t *ChatEventStore) Delete(ctx context.Context, id []byte) error {
	return errors.New("Chat events are immutable")
}

func (t *ChatEventStore) ListByThread(ctx context.Context, threadID []byte) ([]*store.ChatEvent, error) {
	return t.store.ListByThread(ctx, threadID)
}
