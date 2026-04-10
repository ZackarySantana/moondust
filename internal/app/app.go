package app

import (
	"context"
	"fmt"
	"log/slog"
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

	if err := runtime.InitializeNotifications(ctx); err != nil {
		slog.WarnContext(ctx, "notification service init failed; desktop notifications may be unavailable", "error", err)
	}
	if _, err := runtime.RequestNotificationAuthorization(ctx); err != nil {
		slog.DebugContext(ctx, "notification authorization", "error", err)
	}
	applyWindowsToastDisplayName()
}

func (a *App) Shutdown(ctx context.Context) {
	runtime.CleanupNotifications(ctx)
}

// SelectProjectFolder uses the OS picker so paths match what the user actually selected
// and platform permission prompts run in the native flow.
func (a *App) SelectProjectFolder() (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Project Folder",
	})
}

func (a *App) CreateProjectFromRemote(name, remoteURL string) (*store.Project, error) {
	p, err := a.service.CreateProjectFromRemote(a.ctx, name, remoteURL)
	if err != nil {
		return nil, err
	}
	a.notifyProjectCreated(p)
	return p, nil
}

func (a *App) CreateProjectFromFolder(name, directory string) (*store.Project, error) {
	p, err := a.service.CreateProjectFromFolder(a.ctx, name, directory)
	if err != nil {
		return nil, err
	}
	a.notifyProjectCreated(p)
	return p, nil
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

func (a *App) notifyProjectCreated(p *store.Project) {
	if p == nil {
		return
	}
	if !runtime.IsNotificationAvailable(a.ctx) {
		return
	}
	err := runtime.SendNotification(a.ctx, runtime.NotificationOptions{
		ID:    fmt.Sprintf("project-created-%s", p.ID),
		Title: "Moondust",
		Body:  fmt.Sprintf("Project %q is ready.", p.Name),
	})
	if err != nil {
		slog.Debug("send project created notification", "error", err)
	}
}
