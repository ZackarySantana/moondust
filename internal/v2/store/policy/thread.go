package policy

import (
	"context"
	"moondust/internal/v2/store"
	"time"
)

var _ store.ThreadStore = (*ThreadStore)(nil)

type ThreadStore struct {
	store store.ThreadStore
}

func WrapThread(store store.ThreadStore) *ThreadStore {
	return &ThreadStore{store}
}

func (t *ThreadStore) Get(ctx context.Context, id []byte) (*store.Thread, error) {
	return t.store.Get(ctx, id)
}

func (t *ThreadStore) Put(ctx context.Context, id []byte, data *store.Thread) error {
	now := time.Now()
	data.CreatedAt = now
	data.UpdatedAt = now
	return t.store.Put(ctx, id, data)
}

func (t *ThreadStore) List(ctx context.Context) ([]*store.Thread, error) {
	return t.store.List(ctx)
}

func (t *ThreadStore) Update(ctx context.Context, id []byte, data *store.Thread) error {
	data.UpdatedAt = time.Now()
	return t.store.Update(ctx, id, data)
}

func (t *ThreadStore) Delete(ctx context.Context, id []byte) error {
	return t.store.Delete(ctx, id)
}

func (t *ThreadStore) ListByProject(ctx context.Context, projectID []byte) ([]*store.Thread, error) {
	return t.store.ListByProject(ctx, projectID)
}
