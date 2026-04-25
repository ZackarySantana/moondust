package bbolt

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"go.etcd.io/bbolt"
)

var errEventFound = errors.New("event found")

// nestedStore is a helper store to store data in a nested bucket.
// It does not implement the store interface.
type nestedStore[T any] struct {
	db *bbolt.DB

	bucket []byte
}

func newNestedStore[T any](db *bbolt.DB, bucket []byte) *nestedStore[T] {
	return &nestedStore[T]{
		db:     db,
		bucket: bucket,
	}
}

func (b *nestedStore[T]) Put(ctx context.Context, nestedBucketKey []byte, id []byte, data *T) error {
	return b.db.Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists(b.bucket)
		if err != nil {
			return fmt.Errorf("create bucket: %w", err)
		}
		bucket, err = bucket.CreateBucketIfNotExists(nestedBucketKey)
		if err != nil {
			return fmt.Errorf("create nested bucket: %w", err)
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

func (b *nestedStore[T]) Get(ctx context.Context, find func(T) bool) (*T, error) {
	// We have to get all buckets and then go through each bucket and get the data, see if it matches our id.
	var event T
	err := b.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(b.bucket)
		if bucket == nil {
			return nil
		}

		return bucket.ForEachBucket(func(k []byte) error {
			return bucket.Bucket(k).ForEach(func(k, v []byte) error {
				if err := json.Unmarshal(v, &event); err != nil {
					return fmt.Errorf("unmarshal event: %w", err)
				}
				if !find(event) {
					return nil
				}
				return errEventFound
			})
		})
	})
	// Ignore the error if the event is found.
	if errors.Is(err, errEventFound) {
		return &event, nil
	}
	return nil, err
}

func (b *nestedStore[T]) ListAll(ctx context.Context) ([]*T, error) {
	var data []*T
	err := b.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(b.bucket)
		if bucket == nil {
			return nil
		}
		return bucket.ForEachBucket(func(k []byte) error {
			return bucket.Bucket(k).ForEach(func(k, v []byte) error {
				var item T
				if err := json.Unmarshal(v, &item); err != nil {
					return fmt.Errorf("unmarshal data: %w", err)
				}
				data = append(data, &item)
				return nil
			})
		})
	})
	return data, err
}

func (b *nestedStore[T]) List(ctx context.Context, nestedBucketKey []byte) ([]*T, error) {
	var data []*T
	err := b.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(b.bucket)
		if bucket == nil {
			return nil
		}
		bucket = bucket.Bucket(nestedBucketKey)
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

func (b *nestedStore[T]) Update(ctx context.Context, nestedBucketKey []byte, id []byte, data *T) error {
	return b.db.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(b.bucket)
		if bucket == nil {
			return fmt.Errorf("bucket not found")
		}
		bucket = bucket.Bucket(nestedBucketKey)
		if bucket == nil {
			return fmt.Errorf("nested bucket not found")
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

func (b *nestedStore[T]) Delete(ctx context.Context, find func(T) bool) error {
	err := b.db.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(b.bucket)
		if bucket == nil {
			return fmt.Errorf("bucket not found")
		}
		return bucket.ForEachBucket(func(k []byte) error {
			return bucket.Bucket(k).ForEach(func(k, v []byte) error {
				var event T
				if err := json.Unmarshal(v, &event); err != nil {
					return fmt.Errorf("unmarshal event: %w", err)
				}
				if !find(event) {
					return nil
				}
				err := bucket.Bucket(k).Delete(k)
				if err != nil {
					return fmt.Errorf("delete event: %w", err)
				}
				return errEventFound
			})
		})
	})

	if errors.Is(err, errEventFound) {
		return nil
	}
	return err
}
