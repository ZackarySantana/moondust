package policy

import (
	"context"
	"time"

	"moondust/internal/v2/store"
)

var _ store.ProjectStore = (*ProjectStore)(nil)

type ProjectStore struct {
	store store.ProjectStore
}

func WrapProject(store store.ProjectStore) *ProjectStore {
	return &ProjectStore{store}
}

func (t *ProjectStore) Get(ctx context.Context, id []byte) (*store.Project, error) {
	return t.store.Get(ctx, id)
}

func (t *ProjectStore) Put(ctx context.Context, id []byte, data *store.Project) error {
	now := time.Now()
	data.CreatedAt = now
	data.UpdatedAt = now
	return t.store.Put(ctx, id, data)
}

func (t *ProjectStore) List(ctx context.Context) ([]*store.Project, error) {
	return t.store.List(ctx)
}

func (t *ProjectStore) Update(ctx context.Context, id []byte, data *store.Project) error {
	data.UpdatedAt = time.Now()
	return t.store.Update(ctx, id, data)
}

func (t *ProjectStore) Delete(ctx context.Context, id []byte) error {
	return t.store.Delete(ctx, id)
}
