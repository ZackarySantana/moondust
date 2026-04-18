package bbolt

import (
	"context"
	"encoding/json"
	"fmt"
	"moondust/internal/v1/store"

	"go.etcd.io/bbolt"
)

var (
	bucketSettings = []byte("settings")
	keyGlobal      = []byte("global")
)

func NewSettings(db *bbolt.DB) store.SettingsStore {
	if db == nil {
		panic("db is nil")
	}
	return &settingsStore{db: db}
}

type settingsStore struct {
	db *bbolt.DB
}

func (s *settingsStore) Get(_ context.Context) (*store.Settings, error) {
	settings := &store.Settings{}
	err := s.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketSettings)
		if bucket == nil {
			return nil
		}
		raw := bucket.Get(keyGlobal)
		if raw == nil {
			return nil
		}
		return json.Unmarshal(raw, settings)
	})
	return settings, err
}

func (s *settingsStore) Save(_ context.Context, settings *store.Settings) error {
	data, err := json.Marshal(settings)
	if err != nil {
		return fmt.Errorf("marshal settings: %w", err)
	}
	return s.db.Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists(bucketSettings)
		if err != nil {
			return fmt.Errorf("create bucket: %w", err)
		}
		return bucket.Put(keyGlobal, data)
	})
}
