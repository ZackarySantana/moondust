package service

import (
	"context"
	"fmt"
	"log/slog"
	"moondust/internal/v1/rand"
	"moondust/internal/v1/store"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-git/go-git/v5"
)

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

	settings, err := s.settingsStore.Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("loading settings: %w", err)
	}
	auth, authErr := sshAuthForURL(remoteURL, settings.SSHAuthSock)
	if authErr != nil {
		return nil, authErr
	}
	_, err = git.PlainClone(project.Directory, false, &git.CloneOptions{
		URL:  remoteURL,
		Auth: auth,
	})
	if err != nil {
		return nil, fmt.Errorf("git clone: %w", err)
	}

	configureClonedRepo(ctx, project.Directory)

	project.DefaultBranch = "origin/" + detectDefaultBranchAfterClone(ctx, project.Directory)
	project.AutoFetch = "both"

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

func (s *Service) CreateProjectFromFolder(ctx context.Context, name, directory, defaultBranch string) (*store.Project, error) {
	defaultBranch = strings.TrimSpace(defaultBranch)
	if defaultBranch == "" {
		defaultBranch = "origin/main"
	}
	if !strings.Contains(defaultBranch, "/") {
		defaultBranch = "origin/" + defaultBranch
	}
	project := &store.Project{
		ID:            rand.Text(),
		Name:          strings.TrimSpace(name),
		Directory:     directory,
		DefaultBranch: defaultBranch,
		AutoFetch:     "both",
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

func (s *Service) UpdateProject(ctx context.Context, patch *store.Project) error {
	if patch == nil || strings.TrimSpace(patch.ID) == "" {
		return fmt.Errorf("project id is required")
	}
	existing, err := s.projectStore.Get(ctx, patch.ID)
	if err != nil {
		return fmt.Errorf("get project: %w", err)
	}
	if existing == nil {
		return fmt.Errorf("project not found")
	}
	name := strings.TrimSpace(patch.Name)
	if name == "" {
		return fmt.Errorf("name is required")
	}
	existing.Name = name
	existing.RemoteURL = patch.RemoteURL
	existing.DefaultBranch = strings.TrimSpace(patch.DefaultBranch)
	existing.AutoFetch = normalizeProjectAutoFetch(patch.AutoFetch)
	return s.projectStore.Update(ctx, existing)
}

func normalizeProjectAutoFetch(v string) string {
	s := strings.TrimSpace(strings.ToLower(v))
	switch s {
	case "off", "new_thread", "fork", "both":
		return s
	case "":
		return "both"
	default:
		return "both"
	}
}

func (s *Service) DeleteProject(ctx context.Context, id string, deleteFiles bool) error {
	var dirToRemove string
	if deleteFiles {
		project, err := s.projectStore.Get(ctx, id)
		if err != nil {
			return fmt.Errorf("get project: %w", err)
		}
		if project != nil && project.Directory != "" {
			dirToRemove = project.Directory
		}
	}

	if err := s.projectStore.Delete(ctx, id); err != nil {
		return err
	}

	if dirToRemove != "" {
		go func() {
			if err := os.RemoveAll(dirToRemove); err != nil {
				slog.Warn("failed to remove project directory", "dir", dirToRemove, "error", err)
			}
		}()
	}
	return nil
}
