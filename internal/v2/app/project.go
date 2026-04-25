package app

import (
	"context"
	"moondust/internal/v2/service"
	"moondust/internal/v2/store"
)

type Project struct {
	ctx context.Context

	service *service.Project
}

func NewProject(service *service.Project) *Project {
	return &Project{
		ctx:     context.Background(),
		service: service,
	}
}

func (p *Project) Get(id string) (*store.Project, error) {
	return p.service.Get(p.ctx, id)
}

func (p *Project) List() ([]*store.Project, error) {
	return p.service.List(p.ctx)
}
