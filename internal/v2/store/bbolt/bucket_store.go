package bbolt

import (
	"context"
	"encoding/json"
	"fmt"
	"moondust/internal/v2/store"

	"go.etcd.io/bbolt"
)

var _ store.Store[any] = (*bucketStore[any])(nil)

type bucketStore[T any] struct {
	db *bbolt.DB

	bucket []byte
}

func new[T any](db *bbolt.DB, bucket []byte) *bucketStore[T] {
	return &bucketStore[T]{
		db:     db,
		bucket: bucket,
	}
}

func New(db *bbolt.DB) (*store.Stores, error) {
	store := &store.Stores{
		Project:   newProject(db),
		Thread:    newThread(db),
		ChatEvent: newChatEvent(db),
		Settings: struct {
			Global     store.SettingsStore
			OpenRouter store.OpenRouterSettingsStore
			Cursor     store.CursorSettingsStore
			Claude     store.ClaudeSettingsStore
		}{
			Global:     newSettings(db),
			OpenRouter: newOpenRouterSettings(db),
			Cursor:     newCursorSettings(db),
			Claude:     newClaudeSettings(db),
		},
		Log: newLog(db),
	}

	if err := store.Validate(); err != nil {
		return nil, fmt.Errorf("validate store: %w", err)
	}

	return store, nil
}

func (b *bucketStore[T]) Put(ctx context.Context, id []byte, data *T) error {
	return b.db.Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists(b.bucket)
		if err != nil {
			return fmt.Errorf("create bucket: %w", err)
		}
		raw, err := json.Marshal(data)
		if err != nil {
			return fmt.Errorf("marshal data: %w", err)
		}
		err = bucket.Put(id, raw)
		if err != nil {
			return fmt.Errorf("put data: %w", err)
		}
		return nil
	})
}

func (b *bucketStore[T]) Get(ctx context.Context, id []byte) (*T, error) {
	var data *T
	err := b.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(b.bucket)
		if bucket == nil {
			return nil
		}
		raw := bucket.Get(id)
		if len(raw) == 0 {
			return fmt.Errorf("data not found")
		}
		if err := json.Unmarshal(raw, &data); err != nil {
			return fmt.Errorf("unmarshal data: %w", err)
		}
		return nil
	})
	return data, err
}

func (b *bucketStore[T]) List(ctx context.Context) ([]*T, error) {
	var data []*T
	err := b.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(b.bucket)
		if bucket == nil {
			return nil
		}
		return bucket.ForEach(func(k, v []byte) error {
			var item T
			if err := json.Unmarshal(v, &item); err != nil {
				return fmt.Errorf("unmarshal data: %w", err)
			}
			data = append(data, &item)
			return nil
		})
	})
	return data, err
}

func (b *bucketStore[T]) Update(ctx context.Context, id []byte, data *T) error {
	return b.db.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(b.bucket)
		if bucket == nil {
			return fmt.Errorf("bucket not found")
		}
		// If there is an existing item, merge it with the new data.
		if raw := bucket.Get(id); len(raw) > 0 {
			var item T
			if err := json.Unmarshal(raw, &item); err != nil {
				return fmt.Errorf("unmarshal data: %w", err)
			}
			var err error
			data, err = merge(&item, data)
			if err != nil {
				return fmt.Errorf("merge data: %w", err)
			}
		}

		raw, err := json.Marshal(data)
		if err != nil {
			return fmt.Errorf("marshal data: %w", err)
		}

		if err = bucket.Put(id, raw); err != nil {
			return fmt.Errorf("put data: %w", err)
		}
		return nil
	})
}

func (b *bucketStore[T]) Delete(ctx context.Context, id []byte) error {
	return b.db.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(b.bucket)
		if bucket == nil {
			return fmt.Errorf("bucket not found")
		}
		return bucket.Delete(id)
	})
}
