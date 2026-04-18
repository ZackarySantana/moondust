package service

import (
	"context"
	"log/slog"
	"moondust/internal/v1/store"
	"strings"
)

// maybeAutoFetchProject runs `git fetch origin` in the project repo when AutoFetch matches trigger
// ("new_thread" or "fork"). Failures are logged and do not block the operation.
func (s *Service) maybeAutoFetchProject(ctx context.Context, project *store.Project, trigger string) {
	if project == nil || !projectAutoFetchShouldRun(project.AutoFetch, trigger) {
		return
	}
	dir := strings.TrimSpace(project.Directory)
	if dir == "" {
		return
	}
	if _, err := runGit(ctx, dir, "rev-parse", "--git-dir"); err != nil {
		return
	}
	if _, err := runGit(ctx, dir, "remote", "get-url", "origin"); err != nil {
		slog.Debug("auto-fetch skipped: no origin remote", "project_id", project.ID)
		return
	}
	if _, err := runGit(ctx, dir, "fetch", "origin"); err != nil {
		slog.Warn("auto-fetch failed", "project_id", project.ID, "dir", dir, "error", err)
	}
}

func projectAutoFetchShouldRun(mode, trigger string) bool {
	mode = strings.TrimSpace(strings.ToLower(mode))
	if mode == "" {
		mode = "both"
	}
	if mode == "off" {
		return false
	}
	switch mode {
	case "new_thread":
		return trigger == "new_thread"
	case "fork":
		return trigger == "fork"
	case "both":
		return trigger == "new_thread" || trigger == "fork"
	default:
		return false
	}
}
