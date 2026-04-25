package app

import (
	"context"
	"moondust/internal/v2/store"
)

type Project struct {
	ctx context.Context

	stores *store.Stores
}

func NewProject(stores *store.Stores) *Project {
	return &Project{
		ctx:    context.Background(),
		stores: stores,
	}
}

func (p *Project) GetProject(id string) (*store.Project, error) {
	return p.stores.Project.Get(p.ctx, []byte(id))
}

func (p *Project) GetProjects() ([]*store.Project, error) {
	return p.stores.Project.List(p.ctx)
}
