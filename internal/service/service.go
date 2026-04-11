package service

import (
	"context"
	"crypto/rand"
	"fmt"
	"log/slog"
	"moondust/internal/store"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/go-git/go-git/v5"
)

type Service struct {
	projectStore store.ProjectStore
	threadStore  store.ThreadStore
	messageStore store.MessageStore
}

func New(projectStore store.ProjectStore, threadStore store.ThreadStore, messageStore store.MessageStore) *Service {
	return &Service{
		projectStore: &store.ValidateProjectStore{
			ProjectStore: projectStore,
		},
		threadStore:  threadStore,
		messageStore: messageStore,
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

	configureClonedRepo(ctx, project.Directory)

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

func (s *Service) CreateThread(ctx context.Context, projectID string) (*store.Thread, error) {
	project, err := s.projectStore.Get(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("get project: %w", err)
	}
	if project == nil {
		return nil, fmt.Errorf("project not found")
	}
	thread := &store.Thread{
		ID:        rand.Text(),
		ProjectID: projectID,
		Title:     "New thread",
		CreatedAt: time.Now().UTC(),
	}
	if err := thread.Validate(); err != nil {
		return nil, err
	}
	if err := s.threadStore.Update(ctx, thread); err != nil {
		return nil, fmt.Errorf("update thread: %w", err)
	}
	return thread, nil
}

func (s *Service) GetThread(ctx context.Context, id string) (*store.Thread, error) {
	return s.threadStore.Get(ctx, id)
}

func (s *Service) ListThreads(ctx context.Context) ([]*store.Thread, error) {
	threads, err := s.threadStore.List(ctx)
	if err != nil {
		return nil, err
	}
	sort.Slice(threads, func(i, j int) bool {
		return threads[i].CreatedAt.After(threads[j].CreatedAt)
	})
	return threads, nil
}

func (s *Service) ListThreadMessages(ctx context.Context, threadID string) ([]*store.ChatMessage, error) {
	if _, err := s.threadStore.Get(ctx, threadID); err != nil {
		return nil, fmt.Errorf("get thread: %w", err)
	}
	return s.messageStore.ListByThread(ctx, threadID)
}

func (s *Service) SendThreadMessage(ctx context.Context, threadID, content string) ([]*store.ChatMessage, error) {
	thread, err := s.threadStore.Get(ctx, threadID)
	if err != nil {
		return nil, fmt.Errorf("get thread: %w", err)
	}
	if thread == nil {
		return nil, fmt.Errorf("thread not found")
	}

	trimmed := strings.TrimSpace(content)
	if trimmed == "" {
		return nil, fmt.Errorf("message cannot be empty")
	}

	now := time.Now().UTC()
	userMessage := &store.ChatMessage{
		ID:        rand.Text(),
		ThreadID:  threadID,
		Role:      "user",
		Content:   trimmed,
		CreatedAt: now,
	}
	replyMessage := &store.ChatMessage{
		ID:        rand.Text(),
		ThreadID:  threadID,
		Role:      "assistant",
		Content:   fmt.Sprintf("%s says the robot", trimmed),
		CreatedAt: now.Add(time.Millisecond),
	}
	if err := userMessage.Validate(); err != nil {
		return nil, err
	}
	if err := replyMessage.Validate(); err != nil {
		return nil, err
	}

	if err := s.messageStore.Append(ctx, threadID, userMessage, replyMessage); err != nil {
		return nil, fmt.Errorf("append thread messages: %w", err)
	}

	if thread.Title == "New thread" {
		runes := []rune(trimmed)
		if len(runes) > 48 {
			runes = runes[:48]
		}
		thread.Title = string(runes)
		if err := s.threadStore.Update(ctx, thread); err != nil {
			return nil, fmt.Errorf("update thread title: %w", err)
		}
	}

	return []*store.ChatMessage{userMessage, replyMessage}, nil
}

func (s *Service) GetThreadGitStatus(ctx context.Context, threadID string) (*store.GitStatus, error) {
	thread, err := s.threadStore.Get(ctx, threadID)
	if err != nil {
		return nil, fmt.Errorf("get thread: %w", err)
	}
	if thread == nil {
		return nil, fmt.Errorf("thread not found")
	}
	project, err := s.projectStore.Get(ctx, thread.ProjectID)
	if err != nil {
		return nil, fmt.Errorf("get project: %w", err)
	}
	if project == nil {
		return nil, fmt.Errorf("project not found")
	}

	cmd := exec.CommandContext(ctx, "git", "-C", project.Directory, "status", "--short", "--branch")
	out, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("git status: %w: %s", err, strings.TrimSpace(string(out)))
	}

	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	status := &store.GitStatus{}
	for i, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		if i == 0 && strings.HasPrefix(line, "## ") {
			status.Branch = strings.TrimPrefix(line, "## ")
			continue
		}
		status.Entries = append(status.Entries, line)
	}
	return status, nil
}

func (s *Service) GetThreadGitReview(ctx context.Context, threadID string) (*store.GitReview, error) {
	thread, project, err := s.resolveThreadProject(ctx, threadID)
	if err != nil {
		return nil, err
	}
	_ = thread

	review := &store.GitReview{
		RemoteURL: project.RemoteURL,
	}

	statusOut, err := runGit(ctx, project.Directory, "status", "--porcelain=v1", "--branch")
	if err != nil {
		return nil, err
	}
	parseGitStatus(review, statusOut)

	defaultBranch := detectDefaultBranch(ctx, project.Directory)

	localOut, err := runGit(ctx, project.Directory, "log", "--no-color",
		"--pretty=format:%h\t%s\t%an\t%ar\t%aI", defaultBranch+"..HEAD", "-n", "20")
	if err == nil {
		review.LocalCommits = parseCommitsWithDate(localOut)
	}

	mainOut, err := runGit(ctx, project.Directory, "log", "--no-color",
		"--pretty=format:%h\t%s\t%an\t%ar\t%aI", defaultBranch, "-n", "8")
	if err == nil {
		review.MainCommits = parseCommitsWithDate(mainOut)
	}

	diffStatOut, err := runGit(ctx, project.Directory, "diff", "--stat")
	if err == nil {
		review.DiffStat = strings.TrimSpace(diffStatOut)
	}

	patchOut, err := runGit(ctx, project.Directory, "diff", "--no-color", "--", ".")
	if err == nil {
		patch := strings.TrimSpace(patchOut)
		if patch == "" {
			cachedOut, cachedErr := runGit(ctx, project.Directory, "diff", "--cached", "--no-color", "--", ".")
			if cachedErr == nil {
				patch = strings.TrimSpace(cachedOut)
			}
		}
		if len(patch) > 8000 {
			patch = patch[:8000] + "\n\n... (truncated)"
		}
		review.PatchPreview = patch
	}

	return review, nil
}

func (s *Service) resolveThreadProject(ctx context.Context, threadID string) (*store.Thread, *store.Project, error) {
	thread, err := s.threadStore.Get(ctx, threadID)
	if err != nil {
		return nil, nil, fmt.Errorf("get thread: %w", err)
	}
	if thread == nil {
		return nil, nil, fmt.Errorf("thread not found")
	}
	project, err := s.projectStore.Get(ctx, thread.ProjectID)
	if err != nil {
		return nil, nil, fmt.Errorf("get project: %w", err)
	}
	if project == nil {
		return nil, nil, fmt.Errorf("project not found")
	}
	return thread, project, nil
}

func runGit(ctx context.Context, dir string, args ...string) (string, error) {
	cmd := exec.CommandContext(ctx, "git", append([]string{"-C", dir}, args...)...)
	hideConsoleWindow(cmd)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("git %s: %w: %s", strings.Join(args, " "), err, strings.TrimSpace(string(out)))
	}
	return string(out), nil
}

func configureClonedRepo(ctx context.Context, dir string) {
	if runtime.GOOS != "windows" {
		return
	}
	if _, err := runGit(ctx, dir, "config", "core.fileMode", "false"); err != nil {
		slog.WarnContext(ctx, "failed to set core.fileMode", "error", err)
	}
	if _, err := runGit(ctx, dir, "config", "core.autocrlf", "true"); err != nil {
		slog.WarnContext(ctx, "failed to set core.autocrlf", "error", err)
	}
}

var aheadBehindRe = regexp.MustCompile(`ahead (\d+)|behind (\d+)`)

func parseGitStatus(review *store.GitReview, raw string) {
	lines := strings.Split(strings.TrimSpace(raw), "\n")
	for _, line := range lines {
		if line == "" {
			continue
		}
		if strings.HasPrefix(line, "## ") {
			branchLine := strings.TrimPrefix(line, "## ")
			review.Branch = branchLine
			for _, m := range aheadBehindRe.FindAllStringSubmatch(branchLine, -1) {
				if m[1] != "" {
					if v, err := strconv.Atoi(m[1]); err == nil {
						review.Ahead = v
					}
				}
				if m[2] != "" {
					if v, err := strconv.Atoi(m[2]); err == nil {
						review.Behind = v
					}
				}
			}
			continue
		}
		if strings.HasPrefix(line, "?? ") {
			path := strings.TrimSpace(strings.TrimPrefix(line, "?? "))
			review.Untracked = append(review.Untracked, store.GitFileChange{
				Path:   path,
				Status: "untracked",
			})
			continue
		}
		if len(line) < 4 {
			continue
		}
		x := line[0]
		y := line[1]
		path := strings.TrimSpace(line[3:])
		if x != ' ' {
			review.Staged = append(review.Staged, store.GitFileChange{
				Path:   path,
				Status: string(x),
			})
		}
		if y != ' ' {
			review.Unstaged = append(review.Unstaged, store.GitFileChange{
				Path:   path,
				Status: string(y),
			})
		}
	}
}

func parseCommitsWithDate(raw string) []store.GitCommitSummary {
	var commits []store.GitCommitSummary
	for _, line := range strings.Split(strings.TrimSpace(raw), "\n") {
		if line == "" {
			continue
		}
		parts := strings.Split(line, "\t")
		if len(parts) < 4 {
			continue
		}
		c := store.GitCommitSummary{
			Hash:    parts[0],
			Subject: parts[1],
			Author:  parts[2],
			When:    parts[3],
		}
		if len(parts) >= 5 {
			c.ExactDate = parts[4]
		}
		commits = append(commits, c)
	}
	return commits
}

func detectDefaultBranch(ctx context.Context, dir string) string {
	out, err := runGit(ctx, dir, "symbolic-ref", "refs/remotes/origin/HEAD")
	if err == nil {
		ref := strings.TrimSpace(out)
		if i := strings.LastIndex(ref, "/"); i >= 0 {
			return ref[i+1:]
		}
	}
	for _, candidate := range []string{"main", "master"} {
		if _, err := runGit(ctx, dir, "rev-parse", "--verify", candidate); err == nil {
			return candidate
		}
	}
	return "main"
}
