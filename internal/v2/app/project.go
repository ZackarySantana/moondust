package app

import (
	"context"
	"moondust/internal/v2/service"
	"moondust/internal/v2/store"

	"github.com/wailsapp/wails/v2/pkg/runtime"
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

func (p *Project) SetContext(ctx context.Context) {
	if ctx != nil {
		p.ctx = ctx
	}
}

func (p *Project) Get(id string) (*store.Project, error) {
	return p.service.Get(p.ctx, id)
}

func (p *Project) List() ([]*store.Project, error) {
	return p.service.List(p.ctx)
}

// SelectWorkspaceFolder opens the OS folder picker. Returns an empty string if the user cancels.
func (p *Project) SelectWorkspaceFolder() (string, error) {
	return runtime.OpenDirectoryDialog(p.ctx, runtime.OpenDialogOptions{
		Title: "Select workspace folder",
	})
}

// CreateWorkspaceFromFolder adds a workspace for an existing directory. Name may be empty to use the folder name.
func (p *Project) CreateWorkspaceFromFolder(directory, name string) (*store.Project, error) {
	return p.service.CreateFromFolder(p.ctx, directory, name)
}

// CreateWorkspaceFromGit clones a remote and registers it. Name may be empty to derive from the URL.
func (p *Project) CreateWorkspaceFromGit(remoteURL, name string) (*store.Project, error) {
	return p.service.CreateFromGit(p.ctx, remoteURL, name)
}
