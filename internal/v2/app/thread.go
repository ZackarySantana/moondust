package app

import (
	"context"
	"moondust/internal/v2/service"
	"moondust/internal/v2/store"
)

type Thread struct {
	ctx context.Context

	service *service.Thread
}

func NewThread(service *service.Thread) *Thread {
	return &Thread{
		ctx:     context.Background(),
		service: service,
	}
}

func (t *Thread) SetContext(ctx context.Context) {
	if ctx != nil {
		t.ctx = ctx
	}
}

func (t *Thread) Get(id string) (*store.Thread, error) {
	return t.service.Get(t.ctx, id)
}

func (t *Thread) ListByWorkspace(workspaceID string) ([]*store.Thread, error) {
	return t.service.ListByWorkspace(t.ctx, workspaceID)
}

func (t *Thread) List() ([]*store.Thread, error) {
	return t.service.List(t.ctx)
}

func (t *Thread) Rename(id string, title string) error {
	return t.service.Rename(t.ctx, id, title)
}

func (t *Thread) Create(workspaceID string, title string) (*store.Thread, error) {
	return t.service.Create(t.ctx, workspaceID, title)
}
