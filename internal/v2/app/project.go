package app

import (
	"context"
	"fmt"
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

func (p *Project) GetProjects() ([]*store.Project, error) {
	fmt.Println("GetProjects has ran")
	return p.stores.Project.List(p.ctx)
}
