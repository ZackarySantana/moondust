package service

import (
	"context"
	"moondust/internal/v2/store"
)

type Thread struct {
	stores *store.Stores
}

func NewThread(stores *store.Stores) *Thread {
	return &Thread{
		stores: stores,
	}
}

func (t *Thread) Get(ctx context.Context, id string) (*store.Thread, error) {
	return t.stores.Thread.Get(ctx, []byte(id))
}

func (t *Thread) ListByProject(ctx context.Context, projectID string) ([]*store.Thread, error) {
	return t.stores.Thread.ListByProject(ctx, []byte(projectID))
}

func (t *Thread) List(ctx context.Context) ([]*store.Thread, error) {
	return t.stores.Thread.List(ctx)
}

func (t *Thread) Rename(ctx context.Context, id string, title string) error {
	thread, err := t.stores.Thread.Get(ctx, []byte(id))
	if err != nil {
		return err
	}
	thread.Title = title
	return t.stores.Thread.Update(ctx, []byte(id), thread)
}
