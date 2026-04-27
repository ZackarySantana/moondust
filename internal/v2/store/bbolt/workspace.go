package bbolt

import (
	"moondust/internal/v2/store"

	"go.etcd.io/bbolt"
)

var _ store.WorkspaceStore = (*WorkspaceStore)(nil)

type WorkspaceStore struct {
	*bucketStore[store.Workspace]
}

func newWorkspace(db *bbolt.DB) *WorkspaceStore {
	return &WorkspaceStore{
		bucketStore: newBucketStore[store.Workspace](db, []byte("workspace")),
	}
}
