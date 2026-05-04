package app

import (
	"context"
	"moondust/internal/v2/service"
	"moondust/internal/v2/store"
)

type Thread struct {
	service *service.Thread
}

func NewThread(service *service.Thread) *Thread {
	return &Thread{service: service}
}

func (t *Thread) Get(ctx context.Context, id string) (*store.Thread, error) {
	return t.service.Get(ctx, id)
}

func (t *Thread) ListByWorkspace(ctx context.Context, workspaceID string) ([]*store.Thread, error) {
	return t.service.ListByWorkspace(ctx, workspaceID)
}

func (t *Thread) List(ctx context.Context) ([]*store.Thread, error) {
	return t.service.List(ctx)
}

func (t *Thread) Rename(ctx context.Context, id string, title string) error {
	return t.service.Rename(ctx, id, title)
}

func (t *Thread) Create(ctx context.Context, workspaceID string, title string) (*store.Thread, error) {
	return t.service.Create(ctx, workspaceID, title)
}
