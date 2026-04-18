package bbolt

import (
	"context"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"moondust/internal/v1/store"

	"go.etcd.io/bbolt"
)

var bucketLogs = []byte("logs")

func NewLog(db *bbolt.DB) store.LogStore {
	if db == nil {
		panic("db is nil")
	}
	return &logStore{db: db}
}

type logStore struct {
	db *bbolt.DB
}

func (s *logStore) Append(ctx context.Context, line store.LogLine) error {
	_ = ctx
	data, err := json.Marshal(line)
	if err != nil {
		return fmt.Errorf("marshal log line: %w", err)
	}

	key := make([]byte, 8)
	binary.BigEndian.PutUint64(key, line.Seq)

	return s.db.Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists(bucketLogs)
		if err != nil {
			return fmt.Errorf("create logs bucket: %w", err)
		}
		return bucket.Put(key, data)
	})
}

func (s *logStore) List(ctx context.Context) ([]store.LogLine, error) {
	_ = ctx
	var lines []store.LogLine
	err := s.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketLogs)
		if bucket == nil {
			return nil
		}
		return bucket.ForEach(func(k, v []byte) error {
			var line store.LogLine
			if err := json.Unmarshal(v, &line); err != nil {
				return fmt.Errorf("unmarshal log line: %w", err)
			}
			lines = append(lines, line)
			return nil
		})
	})
	return lines, err
}

func (s *logStore) Clear(ctx context.Context) error {
	_ = ctx
	return s.db.Update(func(tx *bbolt.Tx) error {
		if tx.Bucket(bucketLogs) == nil {
			return nil
		}
		return tx.DeleteBucket(bucketLogs)
	})
}

func (s *logStore) MaxSeq(ctx context.Context) (uint64, error) {
	_ = ctx
	var max uint64
	err := s.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketLogs)
		if bucket == nil {
			return nil
		}
		k, _ := bucket.Cursor().Last()
		if k == nil {
			return nil
		}
		if len(k) != 8 {
			return nil
		}
		max = binary.BigEndian.Uint64(k)
		return nil
	})
	return max, err
}
