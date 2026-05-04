package app

import (
	"context"
	"moondust/internal/v2/service"
	"moondust/internal/v2/store"
)

type Workspace struct {
	service *service.Workspace
}

func NewWorkspace(service *service.Workspace) *Workspace {
	return &Workspace{service: service}
}

func (w *Workspace) Get(ctx context.Context, id string) (*store.Workspace, error) {
	return w.service.Get(ctx, id)
}

func (w *Workspace) List(ctx context.Context) ([]*store.Workspace, error) {
	return w.service.List(ctx)
}

func (w *Workspace) CreateWorkspaceFromFolder(ctx context.Context, directory, name string) (*store.Workspace, error) {
	return w.service.CreateFromFolder(ctx, directory, name)
}

func (w *Workspace) CreateWorkspaceFromGit(ctx context.Context, remoteURL, name string) (*store.Workspace, error) {
	return w.service.CreateFromGit(ctx, remoteURL, name)
}

func (w *Workspace) UpdateDetails(ctx context.Context, id, name, baseBranch string) error {
	return w.service.UpdateDetails(ctx, id, name, baseBranch)
}
