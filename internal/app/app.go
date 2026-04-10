package app

import (
	"context"
	"fmt"
	"moondust/internal/notify"
	"moondust/internal/service"
	"moondust/internal/store"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	Ctx context.Context

	service *service.Service
	notify  notify.Channel
}

func New(service *service.Service, notify notify.Channel) *App {
	return &App{
		Ctx:     context.Background(),
		service: service,
		notify:  notify,
	}
}

// SelectProjectFolder uses the OS picker so paths match what the user actually selected
// and platform permission prompts run in the native flow.
func (a *App) SelectProjectFolder() (string, error) {
	return runtime.OpenDirectoryDialog(a.Ctx, runtime.OpenDialogOptions{
		Title: "Select Project Folder",
	})
}

func (a *App) CreateProjectFromRemote(name, remoteURL string) (*store.Project, error) {
	p, err := a.service.CreateProjectFromRemote(a.Ctx, name, remoteURL)
	if err != nil {
		return nil, err
	}
	a.notifyProjectCreated(p)
	return p, nil
}

func (a *App) CreateProjectFromFolder(name, directory string) (*store.Project, error) {
	p, err := a.service.CreateProjectFromFolder(a.Ctx, name, directory)
	if err != nil {
		return nil, err
	}
	a.notifyProjectCreated(p)
	return p, nil
}

func (a *App) GetProject(id string) (*store.Project, error) {
	return a.service.GetProject(a.Ctx, id)
}

func (a *App) ListProjects() ([]*store.Project, error) {
	return a.service.ListProjects(a.Ctx)
}

func (a *App) UpdateProject(project *store.Project) error {
	return a.service.UpdateProject(a.Ctx, project)
}

func (a *App) DeleteProject(id string) error {
	return a.service.DeleteProject(a.Ctx, id)
}

func (a *App) CancelCreateProject() {
}

func (a *App) notifyProjectCreated(p *store.Project) error {
	return a.notify.Send(a.Ctx, notify.NewPushEvent(
		"Project Created",
		fmt.Sprintf("Project %q is ready.", p.Name),
		notify.LevelInfo,
	))
}
