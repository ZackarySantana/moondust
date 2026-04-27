package app

import (
	"context"
	"moondust/internal/v2/service"
	"moondust/internal/v2/store"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Workspace struct {
	ctx context.Context

	service *service.Workspace
}

func NewWorkspace(service *service.Workspace) *Workspace {
	return &Workspace{
		ctx:     context.Background(),
		service: service,
	}
}

func (w *Workspace) SetContext(ctx context.Context) {
	if ctx != nil {
		w.ctx = ctx
	}
}

func (w *Workspace) Get(id string) (*store.Workspace, error) {
	return w.service.Get(w.ctx, id)
}

func (w *Workspace) List() ([]*store.Workspace, error) {
	return w.service.List(w.ctx)
}

func (w *Workspace) SelectWorkspaceFolder() (string, error) {
	return runtime.OpenDirectoryDialog(w.ctx, runtime.OpenDialogOptions{
		Title: "Select workspace folder",
	})
}

func (w *Workspace) CreateWorkspaceFromFolder(directory, name string) (*store.Workspace, error) {
	return w.service.CreateFromFolder(w.ctx, directory, name)
}

func (w *Workspace) CreateWorkspaceFromGit(remoteURL, name string) (*store.Workspace, error) {
	return w.service.CreateFromGit(w.ctx, remoteURL, name)
}
