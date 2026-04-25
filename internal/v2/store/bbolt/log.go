package bbolt

import (
	"moondust/internal/v2/store"

	"go.etcd.io/bbolt"
)

var _ store.LogStore = (*LogStore)(nil)

type LogStore struct {
	*bucketStore[store.Log]
}

func newLog(db *bbolt.DB) *LogStore {
	return &LogStore{
		bucketStore: newBucketStore[store.Log](db, []byte("log")),
	}
}
