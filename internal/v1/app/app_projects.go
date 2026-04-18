package app

import (
	"fmt"
	"moondust/internal/v1/notify"
	"moondust/internal/v1/store"
)

func (a *App) CreateProjectFromRemote(name, remoteURL string) (*store.Project, error) {
	p, err := a.service.CreateProjectFromRemote(a.Ctx, name, remoteURL)
	if err != nil {
		return nil, err
	}
	link := fmt.Sprintf("/project/%s/settings/general", p.ID)
	a.notify.Emit(notify.EventProjectCreated, "Project ready", fmt.Sprintf("%q is set up and ready to use.", p.Name), link)
	return p, nil
}

func (a *App) CreateProjectFromFolder(name, directory, defaultBranch string) (*store.Project, error) {
	p, err := a.service.CreateProjectFromFolder(a.Ctx, name, directory, defaultBranch)
	if err != nil {
		return nil, err
	}
	link := fmt.Sprintf("/project/%s/settings/general", p.ID)
	a.notify.Emit(notify.EventProjectCreated, "Project ready", fmt.Sprintf("%q is set up and ready to use.", p.Name), link)
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

func (a *App) DeleteProject(id string, deleteFiles bool) error {
	return a.service.DeleteProject(a.Ctx, id, deleteFiles)
}
