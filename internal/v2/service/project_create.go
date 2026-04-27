package service

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"moondust/internal/v1/rand"
	"moondust/internal/v2/git"
	"moondust/internal/v2/store"
)

func (p *Project) CreateFromFolder(ctx context.Context, directory, name string) (*store.Project, error) {
	dir := strings.TrimSpace(directory)
	if dir == "" {
		return nil, fmt.Errorf("directory is required")
	}
	abs, err := filepath.Abs(dir)
	if err != nil {
		return nil, fmt.Errorf("resolve path: %w", err)
	}
	fi, err := os.Stat(abs)
	if err != nil {
		return nil, fmt.Errorf("stat directory: %w", err)
	}
	if !fi.IsDir() {
		return nil, fmt.Errorf("not a directory: %s", abs)
	}
	existing, err := p.stores.Project.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("list projects: %w", err)
	}
	absClean := filepath.Clean(abs)
	for _, proj := range existing {
		if proj == nil {
			continue
		}
		if filepath.Clean(proj.Directory) == absClean {
			return nil, fmt.Errorf("this folder is already opened as a workspace")
		}
	}
	displayName := strings.TrimSpace(name)
	if displayName == "" {
		displayName = filepath.Base(absClean)
	}
	if displayName == "" || displayName == "." {
		displayName = "Workspace"
	}
	branch := p.git.DefaultBranch(ctx, absClean)
	out := &store.Project{
		ID:        rand.Text(),
		Name:      displayName,
		Directory: absClean,
		Branch:    branch,
	}
	if err := p.stores.Project.Put(ctx, []byte(out.ID), out); err != nil {
		return nil, fmt.Errorf("save project: %w", err)
	}
	return out, nil
}

func (p *Project) CreateFromGit(ctx context.Context, remoteURL, name string) (*store.Project, error) {
	url := strings.TrimSpace(remoteURL)
	if url == "" {
		return nil, fmt.Errorf("git URL is required")
	}
	displayName := strings.TrimSpace(name)
	if displayName == "" {
		displayName = nameFromGitURL(url)
	}
	cacheDir, err := os.UserCacheDir()
	if err != nil {
		return nil, fmt.Errorf("cache directory: %w", err)
	}
	id := rand.Text()
	targetDir := filepath.Join(cacheDir, "moondust", "repositories", id)

	auth := git.AuthConfig{}
	if gs, err := p.stores.Settings.Global.Get(ctx, []byte("global")); err == nil && gs != nil {
		auth.SSHAuthSocketOverride = strings.TrimSpace(gs.SSHAuthsocket)
	}

	if err := p.git.Clone(ctx, git.CloneOptions{
		URL:       url,
		TargetDir: targetDir,
		Auth:      auth,
	}); err != nil {
		return nil, err
	}

	branch := p.git.DefaultBranch(ctx, targetDir)
	out := &store.Project{
		ID:        id,
		Name:      displayName,
		Directory: targetDir,
		Branch:    branch,
	}
	if err := p.stores.Project.Put(ctx, []byte(id), out); err != nil {
		_ = os.RemoveAll(targetDir)
		return nil, fmt.Errorf("save project: %w", err)
	}
	return out, nil
}

func nameFromGitURL(url string) string {
	u := strings.TrimSuffix(strings.TrimSpace(url), ".git")
	u = strings.TrimSuffix(u, "/")
	if i := strings.LastIndex(u, "/"); i >= 0 && i < len(u)-1 {
		return u[i+1:]
	}
	if i := strings.LastIndex(u, ":"); i >= 0 && i < len(u)-1 {
		return u[i+1:]
	}
	return "repository"
}
