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

func (t *Thread) ListByProject(projectID string) ([]*store.Thread, error) {
	return t.service.ListByProject(t.ctx, projectID)
}

func (t *Thread) List() ([]*store.Thread, error) {
	return t.service.List(t.ctx)
}

func (t *Thread) Rename(id string, title string) error {
	return t.service.Rename(t.ctx, id, title)
}
