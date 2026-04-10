package service

import (
	"context"
	"crypto/rand"
	"fmt"
	"log/slog"
	"moondust/internal/store"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-git/go-git/v5"
)

type Service struct {
	projectStore store.ProjectStore
}

func New(projectStore store.ProjectStore) *Service {
	return &Service{
		projectStore: &store.ValidateProjectStore{
			ProjectStore: projectStore,
		},
	}
}

func (s *Service) CreateProjectFromRemote(ctx context.Context, name, remoteURL string) (*store.Project, error) {
	project := &store.Project{
		ID:        rand.Text(),
		Name:      strings.TrimSpace(name),
		RemoteURL: remoteURL,
	}

	cacheDir, err := os.UserCacheDir()
	if err != nil {
		return nil, fmt.Errorf("getting user cache directory: %w", err)
	}

	project.Directory = filepath.Join(cacheDir, "moondust", "repositories", string(project.ID))

	_, err = git.PlainClone(project.Directory, false, &git.CloneOptions{
		URL: remoteURL,
	})
	if err != nil {
		return nil, fmt.Errorf("git clone: %w", err)
	}

	err = s.projectStore.Update(ctx, project)
	if err != nil {
		// Clean up the project directory.
		rmErr := os.RemoveAll(project.Directory)
		if rmErr != nil {
			slog.ErrorContext(ctx, "failed to clean up project directory", "error", rmErr)
		}
		return nil, fmt.Errorf("update project: %w", err)
	}

	return project, nil
}

func (s *Service) CreateProjectFromFolder(ctx context.Context, name, directory string) (*store.Project, error) {
	project := &store.Project{
		ID:        rand.Text(),
		Name:      strings.TrimSpace(name),
		Directory: directory,
	}

	repository, err := git.PlainOpen(directory)
	if err != nil && err != git.ErrRepositoryNotExists {
		return nil, fmt.Errorf("opening repository: %w", err)
	}
	if repository != nil {
		remotes, err := repository.Remotes()
		if err != nil {
			slog.ErrorContext(ctx, "failed to get remotes", "error", err)
		} else if len(remotes) > 0 {
			project.RemoteURL = remotes[0].Config().URLs[0]
		}
	}

	return project, s.projectStore.Update(ctx, project)
}

func (s *Service) GetProject(ctx context.Context, id string) (*store.Project, error) {
	return s.projectStore.Get(ctx, id)
}

func (s *Service) ListProjects(ctx context.Context) ([]*store.Project, error) {
	return s.projectStore.List(ctx)
}

func (s *Service) UpdateProject(ctx context.Context, project *store.Project) error {
	return s.projectStore.Update(ctx, project)
}

func (s *Service) DeleteProject(ctx context.Context, id string) error {
	return s.projectStore.Delete(ctx, id)
}
