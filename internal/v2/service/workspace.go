package service

import (
	"context"

	"moondust/internal/v2/git"
	"moondust/internal/v2/store"
)

type Workspace struct {
	stores *store.Stores
	git    git.Client
}

func NewWorkspace(stores *store.Stores, g git.Client) *Workspace {
	return &Workspace{
		stores: stores,
		git:    g,
	}
}

func (w *Workspace) Get(ctx context.Context, id string) (*store.Workspace, error) {
	return w.stores.Workspace.Get(ctx, []byte(id))
}

func (w *Workspace) List(ctx context.Context) ([]*store.Workspace, error) {
	return w.stores.Workspace.List(ctx)
}
