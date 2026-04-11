package bbolt

import (
	"context"
	"encoding/json"
	"fmt"
	"moondust/internal/store"

	"go.etcd.io/bbolt"
)

var (
	bucketThreads        = []byte("threads")
	bucketThreadMessages = []byte("thread_messages")
)

func NewThread(db *bbolt.DB) store.ThreadStore {
	if db == nil {
		panic("db is nil")
	}
	return &threadStore{db: db}
}

func NewMessage(db *bbolt.DB) store.MessageStore {
	if db == nil {
		panic("db is nil")
	}
	return &messageStore{db: db}
}

type threadStore struct {
	db *bbolt.DB
}

func (s *threadStore) Get(ctx context.Context, id string) (*store.Thread, error) {
	var thread *store.Thread
	err := s.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketThreads)
		if bucket == nil {
			return nil
		}
		raw := bucket.Get([]byte(id))
		if len(raw) == 0 {
			return nil
		}
		var decoded store.Thread
		if err := json.Unmarshal(raw, &decoded); err != nil {
			return fmt.Errorf("unmarshal thread: %w", err)
		}
		thread = &decoded
		return nil
	})
	return thread, err
}

func (s *threadStore) List(ctx context.Context) ([]*store.Thread, error) {
	var threads []*store.Thread
	err := s.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketThreads)
		if bucket == nil {
			return nil
		}
		return bucket.ForEach(func(_, v []byte) error {
			var thread store.Thread
			if err := json.Unmarshal(v, &thread); err != nil {
				return fmt.Errorf("unmarshal thread: %w", err)
			}
			threads = append(threads, &thread)
			return nil
		})
	})
	return threads, err
}

func (s *threadStore) ListByProject(ctx context.Context, projectID string) ([]*store.Thread, error) {
	all, err := s.List(ctx)
	if err != nil {
		return nil, err
	}
	filtered := make([]*store.Thread, 0, len(all))
	for _, t := range all {
		if t.ProjectID == projectID {
			filtered = append(filtered, t)
		}
	}
	return filtered, nil
}

func (s *threadStore) Update(ctx context.Context, thread *store.Thread) error {
	data, err := json.Marshal(thread)
	if err != nil {
		return fmt.Errorf("marshal thread: %w", err)
	}
	return s.db.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketThreads)
		if bucket == nil {
			bucket, err = tx.CreateBucket(bucketThreads)
			if err != nil {
				return fmt.Errorf("create threads bucket: %w", err)
			}
		}
		return bucket.Put([]byte(thread.ID), data)
	})
}

func (s *threadStore) Delete(ctx context.Context, id string) error {
	return s.db.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketThreads)
		if bucket != nil {
			if err := bucket.Delete([]byte(id)); err != nil {
				return err
			}
		}
		msgBucket := tx.Bucket(bucketThreadMessages)
		if msgBucket != nil {
			if err := msgBucket.Delete([]byte(id)); err != nil {
				return err
			}
		}
		return nil
	})
}

type messageStore struct {
	db *bbolt.DB
}

func (s *messageStore) ListByThread(ctx context.Context, threadID string) ([]*store.ChatMessage, error) {
	var messages []*store.ChatMessage
	err := s.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketThreadMessages)
		if bucket == nil {
			return nil
		}
		raw := bucket.Get([]byte(threadID))
		if len(raw) == 0 {
			return nil
		}
		if err := json.Unmarshal(raw, &messages); err != nil {
			return fmt.Errorf("unmarshal messages: %w", err)
		}
		return nil
	})
	return messages, err
}

func (s *messageStore) Append(ctx context.Context, threadID string, messages ...*store.ChatMessage) error {
	return s.db.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketThreadMessages)
		var err error
		if bucket == nil {
			bucket, err = tx.CreateBucket(bucketThreadMessages)
			if err != nil {
				return fmt.Errorf("create thread messages bucket: %w", err)
			}
		}

		var current []*store.ChatMessage
		raw := bucket.Get([]byte(threadID))
		if len(raw) > 0 {
			if err := json.Unmarshal(raw, &current); err != nil {
				return fmt.Errorf("unmarshal current messages: %w", err)
			}
		}

		current = append(current, messages...)
		data, err := json.Marshal(current)
		if err != nil {
			return fmt.Errorf("marshal thread messages: %w", err)
		}
		return bucket.Put([]byte(threadID), data)
	})
}
