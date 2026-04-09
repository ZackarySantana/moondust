package app

import (
	"context"
	"moondust/internal/service"
	"moondust/internal/store"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context

	service *service.Service
}

func New(service *service.Service) *App {
	return &App{
		ctx:     context.Background(),
		service: service,
	}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

// SelectProjectFolder uses the OS picker so paths match what the user actually selected
// and platform permission prompts run in the native flow.
func (a *App) SelectProjectFolder() (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Project Folder",
	})
}

func (a *App) CreateProjectFromRemote(name, remoteURL string) (*store.Project, error) {
	return a.service.CreateProjectFromRemote(a.ctx, name, remoteURL)
}

func (a *App) CreateProjectFromFolder(name, directory string) (*store.Project, error) {
	return a.service.CreateProjectFromFolder(a.ctx, name, directory)
}

func (a *App) GetProject(id string) (*store.Project, error) {
	return a.service.GetProject(a.ctx, id)
}

func (a *App) ListProjects() ([]*store.Project, error) {
	return a.service.ListProjects(a.ctx)
}

func (a *App) UpdateProject(project *store.Project) error {
	return a.service.UpdateProject(a.ctx, project)
}

func (a *App) DeleteProject(id string) error {
	return a.service.DeleteProject(a.ctx, id)
}

func (a *App) CancelCreateProject() {
}
