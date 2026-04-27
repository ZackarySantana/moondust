package policy

import (
	"context"
	"time"

	"moondust/internal/v2/store"
)

var _ store.WorkspaceStore = (*WorkspaceStore)(nil)

type WorkspaceStore struct {
	store store.WorkspaceStore
}

func WrapWorkspace(store store.WorkspaceStore) *WorkspaceStore {
	return &WorkspaceStore{store}
}

func (t *WorkspaceStore) Get(ctx context.Context, id []byte) (*store.Workspace, error) {
	return t.store.Get(ctx, id)
}

func (t *WorkspaceStore) Put(ctx context.Context, id []byte, data *store.Workspace) error {
	now := time.Now()
	data.CreatedAt = now
	data.UpdatedAt = now
	return t.store.Put(ctx, id, data)
}

func (t *WorkspaceStore) List(ctx context.Context) ([]*store.Workspace, error) {
	return t.store.List(ctx)
}

func (t *WorkspaceStore) Update(ctx context.Context, id []byte, data *store.Workspace) error {
	data.UpdatedAt = time.Now()
	return t.store.Update(ctx, id, data)
}

func (t *WorkspaceStore) Delete(ctx context.Context, id []byte) error {
	return t.store.Delete(ctx, id)
}
