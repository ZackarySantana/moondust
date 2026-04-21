package bbolt

import (
	"context"
	"encoding/json"
	"fmt"
	"moondust/internal/v2/store"

	"go.etcd.io/bbolt"
)

var _ store.ChatEventStore = (*ChatEventStore)(nil)

type ChatEventStore struct {
	*bboltStore[store.ChatEvent]
}

func newChatEvent(db *bbolt.DB) *ChatEventStore {
	return &ChatEventStore{
		bboltStore: new[store.ChatEvent](db, []byte("chat_event")),
	}
}

func (c *ChatEventStore) ListByThread(ctx context.Context, threadID []byte) ([]*store.ChatEvent, error) {
	var events []*store.ChatEvent
	return events, c.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(c.bucket)
		if bucket == nil {
			return fmt.Errorf("bucket not found")
		}
		return bucket.ForEach(func(k, v []byte) error {
			var event store.ChatEvent
			if err := json.Unmarshal(v, &event); err != nil {
				return fmt.Errorf("unmarshal event: %w", err)
			}
			if event.ThreadID != string(threadID) {
				return nil
			}
			events = append(events, &event)
			return nil
		})
	})
}
