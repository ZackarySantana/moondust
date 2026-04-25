package bbolt

import (
	"context"
	"encoding/json"
	"fmt"
	"moondust/internal/v2/store"

	"go.etcd.io/bbolt"
)

var _ store.ThreadStore = (*ThreadStore)(nil)

type ThreadStore struct {
	*bucketStore[store.Thread]
}

func newThread(db *bbolt.DB) *ThreadStore {
	return &ThreadStore{
		bucketStore: newBucketStore[store.Thread](db, []byte("thread")),
	}
}

func (t *ThreadStore) ListByProject(ctx context.Context, projectID []byte) ([]*store.Thread, error) {
	var threads []*store.Thread
	return threads, t.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(t.bucket)
		if bucket == nil {
			return fmt.Errorf("bucket not found")
		}
		return bucket.ForEach(func(k, v []byte) error {
			var thread store.Thread
			if err := json.Unmarshal(v, &thread); err != nil {
				return fmt.Errorf("unmarshal thread: %w", err)
			}
			if thread.ProjectID != string(projectID) {
				return nil
			}
			threads = append(threads, &thread)
			return nil
		})
	})
}
