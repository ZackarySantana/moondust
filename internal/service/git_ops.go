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

// GitStageUntracked runs git add on all paths currently listed as untracked in the thread repo.
func (s *Service) GitStageUntracked(ctx context.Context, threadID string) error {
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	review, err := s.GetThreadGitReview(ctx, threadID)
	if err != nil {
		return err
	}
	paths, err := collectPathsFromChanges(review.Untracked)
	if err != nil {
		return err
	}
	if len(paths) == 0 {
		return fmt.Errorf("no untracked files")
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

// GitPush pushes the current branch to its upstream remote.
func (s *Service) GitPush(ctx context.Context, threadID string) error {
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	_, err = runGit(ctx, dir, "push")
	if err != nil {
		// Try push with --set-upstream for branches without a tracking branch.
		branchOut, branchErr := runGit(ctx, dir, "rev-parse", "--abbrev-ref", "HEAD")
		if branchErr != nil {
			return err
		}
		branch := strings.TrimSpace(branchOut)
		_, err = runGit(ctx, dir, "push", "--set-upstream", "origin", branch)
	}
	return err
}

// GitPull pulls from the upstream remote for the current branch.
func (s *Service) GitPull(ctx context.Context, threadID string) error {
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	_, err = runGit(ctx, dir, "pull")
	return err
}

// GitStageFile stages a single file (git add).
func (s *Service) GitStageFile(ctx context.Context, threadID, filePath string) error {
	if err := validateRepoRelPath(filePath); err != nil {
		return err
	}
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	return s.gitAdd(ctx, dir, []string{normalizeGitPathForOps(filePath)})
}

// GitUnstageFile unstages a single file (git restore --staged).
func (s *Service) GitUnstageFile(ctx context.Context, threadID, filePath string) error {
	if err := validateRepoRelPath(filePath); err != nil {
		return err
	}
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	return s.gitRestoreStaged(ctx, dir, []string{normalizeGitPathForOps(filePath)})
}

// GitDiscardFile discards working tree changes for a single file.
func (s *Service) GitDiscardFile(ctx context.Context, threadID, filePath string) error {
	if err := validateRepoRelPath(filePath); err != nil {
		return err
	}
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	return s.gitRestoreWorktree(ctx, dir, []string{normalizeGitPathForOps(filePath)})
}

// GitStash stashes all working tree and staged changes.
func (s *Service) GitStash(ctx context.Context, threadID string) error {
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	_, err = runGit(ctx, dir, "stash", "push", "-m", "moondust stash")
	return err
}

// GitStashPop pops the most recent stash entry.
func (s *Service) GitStashPop(ctx context.Context, threadID string) error {
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	_, err = runGit(ctx, dir, "stash", "pop")
	return err
}

// GitRenameBranch renames the current branch.
func (s *Service) GitRenameBranch(ctx context.Context, threadID, newName string) error {
	if err := validateBranchName(newName); err != nil {
		return err
	}
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	_, err = runGit(ctx, dir, "branch", "-m", strings.TrimSpace(newName))
	return err
}

// GitFetch runs git fetch in the thread's repo.
func (s *Service) GitFetch(ctx context.Context, threadID string) error {
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	_, err = runGit(ctx, dir, "fetch", "--prune")
	return err
}

// gitPathExists reports whether a path under the repo's git directory exists.
// Uses `git rev-parse --git-path` so linked worktrees resolve to the correct
// location (e.g. .git/worktrees/<id>/rebase-merge), not cwd/.git/rebase-merge.
func gitPathExists(ctx context.Context, dir, gitPath string) bool {
	out, err := runGit(ctx, dir, "rev-parse", "--git-path", gitPath)
	if err != nil {
		return false
	}
	p := strings.TrimSpace(out)
	if p == "" {
		return false
	}
	_, err = os.Stat(p)
	return err == nil
}

func mergeInProgress(ctx context.Context, dir string) bool {
	return gitPathExists(ctx, dir, "MERGE_HEAD")
}

func rebaseInProgress(ctx context.Context, dir string) bool {
	return gitPathExists(ctx, dir, "rebase-merge") || gitPathExists(ctx, dir, "rebase-apply")
}

// prepareWorktreeForRebase aborts any in-progress merge or rebase so a new
// `git rebase` can start. The wizard "Run" flow expects a clean start; users
// mid-conflict use Continue/Abort in the UI instead.
func prepareWorktreeForRebase(ctx context.Context, dir string) (string, error) {
	var notes []string
	if mergeInProgress(ctx, dir) {
		out, err := runGit(ctx, dir, "merge", "--abort")
		if err != nil {
			return "", fmt.Errorf("aborting previous merge before rebase: %w", err)
		}
		s := strings.TrimSpace(out)
		if s != "" {
			notes = append(notes, "Aborted previous merge before rebase.\n"+s)
		} else {
			notes = append(notes, "Aborted previous merge before rebase.")
		}
	}
	if rebaseInProgress(ctx, dir) {
		out, err := runGit(ctx, dir, "rebase", "--abort")
		if err != nil {
			return "", fmt.Errorf("aborting previous rebase: %w", err)
		}
		s := strings.TrimSpace(out)
		if s != "" {
			notes = append(notes, "Aborted incomplete rebase before starting.\n"+s)
		} else {
			notes = append(notes, "Aborted incomplete rebase before starting.")
		}
	}
	return strings.Join(notes, "\n\n"), nil
}

// prepareWorktreeForMerge aborts any in-progress rebase or merge so a new merge can start.
func prepareWorktreeForMerge(ctx context.Context, dir string) (string, error) {
	var notes []string
	if rebaseInProgress(ctx, dir) {
		out, err := runGit(ctx, dir, "rebase", "--abort")
		if err != nil {
			return "", fmt.Errorf("aborting previous rebase before merge: %w", err)
		}
		s := strings.TrimSpace(out)
		if s != "" {
			notes = append(notes, "Aborted incomplete rebase before merge.\n"+s)
		} else {
			notes = append(notes, "Aborted incomplete rebase before merge.")
		}
	}
	if mergeInProgress(ctx, dir) {
		out, err := runGit(ctx, dir, "merge", "--abort")
		if err != nil {
			return "", fmt.Errorf("aborting previous merge: %w", err)
		}
		s := strings.TrimSpace(out)
		if s != "" {
			notes = append(notes, "Aborted previous merge before starting.\n"+s)
		} else {
			notes = append(notes, "Aborted previous merge before starting.")
		}
	}
	return strings.Join(notes, "\n\n"), nil
}

// GitMerge merges the given branch into the current branch. Returns git output.
func (s *Service) GitMerge(ctx context.Context, threadID, branch string) (string, error) {
	if err := validateBranchName(branch); err != nil {
		return "", err
	}
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return "", err
	}
	prep, err := prepareWorktreeForMerge(ctx, dir)
	if err != nil {
		return "", err
	}
	// --no-edit avoids opening an editor for the merge commit message.
	out, err := runGit(ctx, dir, "merge", "--no-edit", strings.TrimSpace(branch))
	if err != nil {
		return "", err
	}
	if prep != "" {
		return prep + "\n\n" + out, nil
	}
	return out, nil
}

// GitRebaseOnto rebases the current branch onto the specified branch. Returns git output.
func (s *Service) GitRebaseOnto(ctx context.Context, threadID, onto string) (string, error) {
	if err := validateBranchName(onto); err != nil {
		return "", err
	}
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return "", err
	}
	prep, err := prepareWorktreeForRebase(ctx, dir)
	if err != nil {
		return "", err
	}
	out, err := runGit(ctx, dir, "rebase", strings.TrimSpace(onto))
	if err != nil {
		return "", err
	}
	if prep != "" {
		return prep + "\n\n" + out, nil
	}
	return out, nil
}

// GitRebaseAbort aborts a rebase in progress.
func (s *Service) GitRebaseAbort(ctx context.Context, threadID string) error {
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return err
	}
	_, err = runGit(ctx, dir, "rebase", "--abort")
	return err
}

// GitRebaseContinue continues a paused rebase after conflict resolution. Returns git output.
func (s *Service) GitRebaseContinue(ctx context.Context, threadID string) (string, error) {
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return "", err
	}
	return runGitWithEnv(ctx, dir, []string{"GIT_EDITOR=true", "GIT_SEQUENCE_EDITOR=true"}, "rebase", "--continue")
}

// GitMergeContinue continues a merge after conflicts are resolved (non-interactive).
func (s *Service) GitMergeContinue(ctx context.Context, threadID string) (string, error) {
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return "", err
	}
	return runGitWithEnv(ctx, dir, []string{"GIT_EDITOR=true"}, "merge", "--continue")
}

// GitConflictState detects merge/rebase state and lists conflicted files.
func (s *Service) GitConflictState(ctx context.Context, threadID string) (*store.GitConflictState, error) {
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return nil, err
	}
	state := &store.GitConflictState{}

	// Use git-path resolution so linked worktrees see the real state (not cwd/.git/...).
	state.InMerge = mergeInProgress(ctx, dir)
	state.InRebase = rebaseInProgress(ctx, dir)

	// List unmerged (conflict) files
	out, err := runGit(ctx, dir, "diff", "--name-only", "--diff-filter=U")
	if err == nil {
		for _, line := range strings.Split(strings.TrimSpace(out), "\n") {
			if line = strings.TrimSpace(line); line != "" {
				state.ConflictFiles = append(state.ConflictFiles, line)
			}
		}
	}
	return state, nil
}

// GitListBranches returns local branch names.
func (s *Service) GitListBranches(ctx context.Context, threadID string) ([]string, error) {
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return nil, err
	}
	out, err := runGit(ctx, dir, "branch", "--format=%(refname:short)")
	if err != nil {
		return nil, err
	}
	var branches []string
	for _, line := range strings.Split(strings.TrimSpace(out), "\n") {
		if line = strings.TrimSpace(line); line != "" {
			branches = append(branches, line)
		}
	}
	return branches, nil
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
