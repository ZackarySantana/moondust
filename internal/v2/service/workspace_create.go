package service

import (
	"context"
	"crypto/rand"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"moondust/internal/v2/git"
	"moondust/internal/v2/store"
)

func (w *Workspace) CreateFromFolder(ctx context.Context, directory, name string) (*store.Workspace, error) {
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
	existing, err := w.stores.Workspace.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("list workspaces: %w", err)
	}
	absClean := filepath.Clean(abs)
	for _, ws := range existing {
		if ws == nil {
			continue
		}
		if filepath.Clean(ws.Directory) == absClean {
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
	branch := w.git.DefaultBranch(ctx, absClean)
	out := &store.Workspace{
		ID:        rand.Text(),
		Name:      displayName,
		Directory: absClean,
		Branch:    branch,
	}
	if err := w.stores.Workspace.Put(ctx, []byte(out.ID), out); err != nil {
		return nil, fmt.Errorf("save workspace: %w", err)
	}
	return out, nil
}

func (w *Workspace) CreateFromGit(ctx context.Context, remoteURL, name string) (*store.Workspace, error) {
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
	if gs, err := w.stores.Settings.Global.Get(ctx, []byte("global")); err == nil && gs != nil {
		auth.SSHAuthSocketOverride = strings.TrimSpace(gs.SSHAuthsocket)
	}

	if err := w.git.Clone(ctx, git.CloneOptions{
		URL:       url,
		TargetDir: targetDir,
		Auth:      auth,
	}); err != nil {
		return nil, err
	}

	branch := w.git.DefaultBranch(ctx, targetDir)
	out := &store.Workspace{
		ID:        id,
		Name:      displayName,
		Directory: targetDir,
		Branch:    branch,
	}
	if err := w.stores.Workspace.Put(ctx, []byte(id), out); err != nil {
		_ = os.RemoveAll(targetDir)
		return nil, fmt.Errorf("save workspace: %w", err)
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
