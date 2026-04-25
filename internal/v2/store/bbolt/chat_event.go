package bbolt

import (
	"context"
	"moondust/internal/v2/store"

	"go.etcd.io/bbolt"
)

var _ store.ChatEventStore = (*ChatEventStore)(nil)

type ChatEventStore struct {
	*nestedStore[store.ChatEvent]
}

func newChatEvent(db *bbolt.DB) *ChatEventStore {
	return &ChatEventStore{
		nestedStore: newNestedStore[store.ChatEvent](db, []byte("chat_event")),
	}
}

func (c *ChatEventStore) Put(ctx context.Context, id []byte, data *store.ChatEvent) error {
	return c.nestedStore.Put(ctx, []byte(data.ThreadID), id, data)
}

func (c *ChatEventStore) Get(ctx context.Context, id []byte) (*store.ChatEvent, error) {
	return c.nestedStore.Get(ctx, func(event store.ChatEvent) bool {
		return event.ID == string(id)
	})
}

func (c *ChatEventStore) List(ctx context.Context) ([]*store.ChatEvent, error) {
	return c.nestedStore.ListAll(ctx)
}

func (c *ChatEventStore) Update(ctx context.Context, id []byte, data *store.ChatEvent) error {
	return c.nestedStore.Update(ctx, []byte(data.ThreadID), id, data)
}

func (c *ChatEventStore) Delete(ctx context.Context, id []byte) error {
	return c.nestedStore.Delete(ctx, func(event store.ChatEvent) bool {
		return event.ID == string(id)
	})
}

func (c *ChatEventStore) ListByThread(ctx context.Context, threadID []byte) ([]*store.ChatEvent, error) {
	return c.nestedStore.List(ctx, []byte(threadID))
}
