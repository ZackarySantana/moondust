package bbolt

import (
	"moondust/internal/v2/store"

	"go.etcd.io/bbolt"
)

var _ store.ProjectStore = (*ProjectStore)(nil)

type ProjectStore struct {
	*bucketStore[store.Project]
}

func newProject(db *bbolt.DB) *ProjectStore {
	return &ProjectStore{
		bucketStore: newBucketStore[store.Project](db, []byte("project")),
	}
}
