package store

import (
	"encoding/json"
	"fmt"

	bolt "go.etcd.io/bbolt"
)

// GetSettings returns the zero value when nothing is stored so callers do not need
// a separate "exists" branch for first run.
func (s *Store) GetSettings() (Settings, error) {
	var out Settings
	if s == nil || s.db == nil {
		return out, nil
	}
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(bucketSettings)
		if b == nil {
			return nil
		}
		v := b.Get(settingsKey)
		if v == nil {
			return nil
		}
		if err := json.Unmarshal(v, &out); err != nil {
			return fmt.Errorf("store: decode settings: %w", err)
		}
		return nil
	})
	return out, err
}

func (s *Store) PutSettings(st Settings) error {
	if s == nil || s.db == nil {
		return fmt.Errorf("store: nil store")
	}
	data, err := json.Marshal(&st)
	if err != nil {
		return fmt.Errorf("store: encode settings: %w", err)
	}
	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(bucketSettings)
		if b == nil {
			return fmt.Errorf("store: settings bucket missing")
		}
		return b.Put(settingsKey, data)
	})
}
