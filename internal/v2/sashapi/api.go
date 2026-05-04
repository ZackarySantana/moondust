package sashapi

import (
	"context"
	"errors"

	"github.com/gen2brain/dlgs"

	"moondust/internal/v2/app"
	"moondust/internal/v2/store"
)

// API is the RPC surface consumed by generated Sash TypeScript bindings.
type API struct {
	workspace *app.Workspace
	thread    *app.Thread
	settings  *app.Settings
}

func New(workspace *app.Workspace, thread *app.Thread, settings *app.Settings) *API {
	return &API{
		workspace: workspace,
		thread:    thread,
		settings:  settings,
	}
}

func (a *API) CreateThread(ctx context.Context, workspaceID string, title string) (*store.Thread, error) {
	return a.thread.Create(ctx, workspaceID, title)
}

func (a *API) CreateWorkspaceFromFolder(ctx context.Context, directory string, name string) (*store.Workspace, error) {
	return a.workspace.CreateWorkspaceFromFolder(ctx, directory, name)
}

func (a *API) CreateWorkspaceFromGit(ctx context.Context, remoteURL string, name string) (*store.Workspace, error) {
	return a.workspace.CreateWorkspaceFromGit(ctx, remoteURL, name)
}

func (a *API) GetGlobalSettings(ctx context.Context) (*store.GlobalSettings, error) {
	return a.settings.GetGlobal(ctx)
}

func (a *API) GetThread(ctx context.Context, id string) (*store.Thread, error) {
	return a.thread.Get(ctx, id)
}

func (a *API) GetWorkspace(ctx context.Context, id string) (*store.Workspace, error) {
	return a.workspace.Get(ctx, id)
}

func (a *API) ListThreads(ctx context.Context) ([]*store.Thread, error) {
	return a.thread.List(ctx)
}

func (a *API) ListThreadsByWorkspace(ctx context.Context, workspaceID string) ([]*store.Thread, error) {
	return a.thread.ListByWorkspace(ctx, workspaceID)
}

func (a *API) ListWorkspaces(ctx context.Context) ([]*store.Workspace, error) {
	return a.workspace.List(ctx)
}

func (a *API) RenameThread(ctx context.Context, id string, title string) error {
	return a.thread.Rename(ctx, id, title)
}

func (a *API) SaveGlobalSettings(ctx context.Context, in *store.GlobalSettings) error {
	return a.settings.SaveGlobal(ctx, in)
}

func (a *API) SelectWorkspaceFolder(ctx context.Context) (string, error) {
	_ = ctx
	path, ok, err := dlgs.File("Select workspace folder", "", true)
	if err != nil {
		return "", err
	}
	if !ok || path == "" {
		return "", errors.New("no folder selected")
	}
	return path, nil
}

func (a *API) UpdateWorkspaceDetails(ctx context.Context, id string, name string, baseBranch string) error {
	return a.workspace.UpdateDetails(ctx, id, name, baseBranch)
}
