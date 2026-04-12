package service

import (
	"context"
	"fmt"
	"moondust/internal/store"
	"os"
	"path/filepath"
	"strings"
)

const gitPathBatchSize = 80

func (s *Service) gitDirForThread(ctx context.Context, threadID string) (string, error) {
	thread, project, err := s.resolveThreadProject(ctx, threadID)
	if err != nil {
		return "", err
	}
	dir := project.Directory
	if thread.WorktreeDir != "" {
		dir = thread.WorktreeDir
	}
	return dir, nil
}

// normalizeGitPathForOps maps a porcelain path to the working-tree path (e.g. rename "a -> b" -> "b").
func normalizeGitPathForOps(p string) string {
	p = strings.TrimSpace(p)
	if idx := strings.LastIndex(p, " -> "); idx >= 0 {
		return strings.TrimSpace(p[idx+len(" -> "):])
	}
	return p
}

func validateRepoRelPath(p string) error {
	if p == "" || strings.Contains(p, "\x00") {
		return fmt.Errorf("empty or invalid path")
	}
	if filepath.IsAbs(p) {
		return fmt.Errorf("absolute paths are not allowed")
	}
	clean := filepath.Clean(p)
	if clean == ".." || strings.HasPrefix(clean, ".."+string(os.PathSeparator)) {
		return fmt.Errorf("path escapes repository")
	}
	return nil
}

func collectPathsFromChanges(changes []store.GitFileChange) ([]string, error) {
	seen := make(map[string]struct{})
	var out []string
	for _, c := range changes {
		p := normalizeGitPathForOps(c.Path)
		if err := validateRepoRelPath(p); err != nil {
			return nil, fmt.Errorf("%q: %w", c.Path, err)
		}
		if _, ok := seen[p]; ok {
			continue
		}
		seen[p] = struct{}{}
		out = append(out, p)
	}
	return out, nil
}

func validateBranchName(branch string) error {
	b := strings.TrimSpace(branch)
	if b == "" {
		return fmt.Errorf("branch name is required")
	}
	if strings.Contains(b, "..") || strings.ContainsAny(b, " \t\r\n") ||
		strings.HasPrefix(b, "/") || strings.HasSuffix(b, "/") || strings.Contains(b, "//") {
		return fmt.Errorf("invalid branch name")
	}
	if strings.HasPrefix(b, "-") || strings.HasPrefix(b, ".") {
		return fmt.Errorf("invalid branch name")
	}
	if len(b) > 200 {
		return fmt.Errorf("branch name too long")
	}
	return nil
}

func commitWithMessage(ctx context.Context, dir, message string) error {
	f, err := os.CreateTemp("", "moondust-commit-msg-*.txt")
	if err != nil {
		return fmt.Errorf("temp commit message file: %w", err)
	}
	path := f.Name()
	defer func() { _ = os.Remove(path) }()

	if _, err := f.WriteString(message); err != nil {
		_ = f.Close()
		return err
	}
	if err := f.Close(); err != nil {
		return err
	}

	_, err = runGit(ctx, dir, "commit", "-F", path)
	return err
}

func (s *Service) gitAdd(ctx context.Context, dir string, paths []string) error {
	for i := 0; i < len(paths); i += gitPathBatchSize {
		end := i + gitPathBatchSize
		if end > len(paths) {
			end = len(paths)
		}
		batch := paths[i:end]
		args := append([]string{"add", "--"}, batch...)
		if _, err := runGit(ctx, dir, args...); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) gitRestoreWorktree(ctx context.Context, dir string, paths []string) error {
	for i := 0; i < len(paths); i += gitPathBatchSize {
		end := i + gitPathBatchSize
		if end > len(paths) {
			end = len(paths)
		}
		batch := paths[i:end]
		args := append([]string{"restore", "--worktree", "--"}, batch...)
		if _, err := runGit(ctx, dir, args...); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) gitRestoreStaged(ctx context.Context, dir string, paths []string) error {
	for i := 0; i < len(paths); i += gitPathBatchSize {
		end := i + gitPathBatchSize
		if end > len(paths) {
			end = len(paths)
		}
		batch := paths[i:end]
		args := append([]string{"restore", "--staged", "--"}, batch...)
		if _, err := runGit(ctx, dir, args...); err != nil {
			return err
		}
	}
	return nil
}

// GitStageUnstaged runs git add on all paths currently listed as unstaged in the thread repo.
func (s *Service) GitStageUnstaged(ctx context.Context, threadID string) error {
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	review, err := s.GetThreadGitReview(ctx, threadID)
	if err != nil {
		return err
	}
	paths, err := collectPathsFromChanges(review.Unstaged)
	if err != nil {
		return err
	}
	if len(paths) == 0 {
		return fmt.Errorf("no unstaged changes")
	}
	return s.gitAdd(ctx, dir, paths)
}

// GitDiscardUnstaged discards unstaged working tree changes (git restore --worktree). Staged content is unchanged.
func (s *Service) GitDiscardUnstaged(ctx context.Context, threadID string) error {
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	review, err := s.GetThreadGitReview(ctx, threadID)
	if err != nil {
		return err
	}
	paths, err := collectPathsFromChanges(review.Unstaged)
	if err != nil {
		return err
	}
	if len(paths) == 0 {
		return fmt.Errorf("no unstaged changes")
	}
	return s.gitRestoreWorktree(ctx, dir, paths)
}

// GitUnstageAll moves all staged paths back to unstaged without changing file contents (git restore --staged).
func (s *Service) GitUnstageAll(ctx context.Context, threadID string) error {
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	review, err := s.GetThreadGitReview(ctx, threadID)
	if err != nil {
		return err
	}
	paths, err := collectPathsFromChanges(review.Staged)
	if err != nil {
		return err
	}
	if len(paths) == 0 {
		return fmt.Errorf("nothing staged")
	}
	return s.gitRestoreStaged(ctx, dir, paths)
}

// GitCommit creates a commit with the given message (staged changes only).
func (s *Service) GitCommit(ctx context.Context, threadID, message string) error {
	message = strings.TrimSpace(message)
	if message == "" {
		return fmt.Errorf("commit message is required")
	}
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	return commitWithMessage(ctx, dir, message)
}

// GitCheckoutNewBranchAndCommit creates a new branch from HEAD and commits staged changes with the given message.
func (s *Service) GitCheckoutNewBranchAndCommit(ctx context.Context, threadID, branch, message string) error {
	message = strings.TrimSpace(message)
	if message == "" {
		return fmt.Errorf("commit message is required")
	}
	if err := validateBranchName(branch); err != nil {
		return err
	}
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	b := strings.TrimSpace(branch)
	if _, err := runGit(ctx, dir, "checkout", "-b", b); err != nil {
		return err
	}
	return commitWithMessage(ctx, dir, message)
}
