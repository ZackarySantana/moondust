package service

import (
	"context"
	"moondust/internal/v2/store"
)

type Project struct {
	stores *store.Stores
}

func NewProject(stores *store.Stores) *Project {
	return &Project{
		stores: stores,
	}
}

func (p *Project) Get(ctx context.Context, id string) (*store.Project, error) {
	return p.stores.Project.Get(ctx, []byte(id))
}

func (p *Project) List(ctx context.Context) ([]*store.Project, error) {
	return p.stores.Project.List(ctx)
}
