package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"moondust/internal/rand"
	"moondust/internal/store"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

func (s *Service) CreateThread(ctx context.Context, projectID string, useWorktree bool) (*store.Thread, error) {
	project, err := s.projectStore.Get(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("get project: %w", err)
	}
	if project == nil {
		return nil, fmt.Errorf("project not found")
	}
	s.maybeAutoFetchProject(ctx, project, "new_thread")

	thread := &store.Thread{
		ID:           rand.Text(),
		ProjectID:    projectID,
		Title:        "New thread",
		CreatedAt:    time.Now().UTC(),
		ChatProvider: "openrouter",
		ChatModel:    "openai/gpt-4o-mini",
	}

	if useWorktree && project.Directory != "" {
		branchName := fmt.Sprintf("moondust/%s", thread.ID[:16])
		// Under .git so the checkout stays out of the normal working tree (editors/file lists)
		// and is never confused with tracked project files.
		worktreeDir := filepath.Join(project.Directory, ".git", "moondust-worktrees", thread.ID[:16])
		if _, err := runGit(ctx, project.Directory, "worktree", "add", "-b", branchName, worktreeDir); err != nil {
			return nil, fmt.Errorf("create worktree: %w", err)
		}
		thread.WorktreeDir = worktreeDir
	}

	if err := thread.Validate(); err != nil {
		return nil, err
	}
	if err := s.threadStore.Update(ctx, thread); err != nil {
		return nil, fmt.Errorf("update thread: %w", err)
	}
	return thread, nil
}

func forkThreadTitle(sourceTitle string) string {
	t := strings.TrimSpace(sourceTitle)
	if t == "" || t == "New thread" {
		return "Fork"
	}
	runes := []rune(t)
	const max = 80
	if len(runes) > max {
		t = string(runes[:max]) + "…"
	}
	return "Fork: " + t
}

func cloneChatMessageForNewThread(m *store.ChatMessage, newThreadID string) (*store.ChatMessage, error) {
	b, err := json.Marshal(m)
	if err != nil {
		return nil, err
	}
	var out store.ChatMessage
	if err := json.Unmarshal(b, &out); err != nil {
		return nil, err
	}
	out.ID = rand.Text()
	out.ThreadID = newThreadID
	return &out, nil
}

// ForkThreadAtMessage creates a new thread in the same project with a copy of messages from the
// source thread through upToMessageID (inclusive). If the source thread uses a git worktree, a new
// worktree is created; otherwise the new thread uses the project directory only (no worktree).
func (s *Service) ForkThreadAtMessage(ctx context.Context, sourceThreadID, upToMessageID string) (*store.Thread, error) {
	sourceThreadID = strings.TrimSpace(sourceThreadID)
	upToMessageID = strings.TrimSpace(upToMessageID)
	if sourceThreadID == "" || upToMessageID == "" {
		return nil, fmt.Errorf("thread id and message id are required")
	}
	source, err := s.threadStore.Get(ctx, sourceThreadID)
	if err != nil {
		return nil, fmt.Errorf("get thread: %w", err)
	}
	if source == nil {
		return nil, fmt.Errorf("thread not found")
	}
	project, err := s.projectStore.Get(ctx, source.ProjectID)
	if err != nil {
		return nil, fmt.Errorf("get project: %w", err)
	}
	if project == nil {
		return nil, fmt.Errorf("project not found")
	}
	s.maybeAutoFetchProject(ctx, project, "fork")

	msgs, err := s.messageStore.ListByThread(ctx, sourceThreadID)
	if err != nil {
		return nil, fmt.Errorf("list messages: %w", err)
	}
	endIdx := -1
	for i, m := range msgs {
		if m != nil && m.ID == upToMessageID {
			endIdx = i
			break
		}
	}
	if endIdx < 0 {
		return nil, fmt.Errorf("message not found in thread")
	}
	slice := msgs[:endIdx+1]

	sourceUsesWorktree := strings.TrimSpace(source.WorktreeDir) != ""
	projectDir := strings.TrimSpace(project.Directory)

	if strings.TrimSpace(source.ChatProvider) == "" {
		return nil, fmt.Errorf("cannot fork: source thread has no chat_provider")
	}
	newThread := &store.Thread{
		ID:           rand.Text(),
		ProjectID:    source.ProjectID,
		Title:        forkThreadTitle(source.Title),
		CreatedAt:    time.Now().UTC(),
		ChatProvider: strings.TrimSpace(source.ChatProvider),
		ChatModel:    source.ChatModel,
	}
	if strings.TrimSpace(newThread.ChatModel) == "" {
		newThread.ChatModel = "openai/gpt-4o-mini"
	}

	if sourceUsesWorktree && projectDir != "" {
		branchName := fmt.Sprintf("moondust/%s", newThread.ID[:16])
		worktreeDir := filepath.Join(projectDir, ".git", "moondust-worktrees", newThread.ID[:16])
		if _, err := runGit(ctx, projectDir, "worktree", "add", "-b", branchName, worktreeDir); err != nil {
			return nil, fmt.Errorf("create worktree: %w", err)
		}
		newThread.WorktreeDir = worktreeDir
	}

	if err := newThread.Validate(); err != nil {
		s.rollbackForkedThread(ctx, newThread.ID, newThread.WorktreeDir, projectDir)
		return nil, err
	}
	if err := s.threadStore.Update(ctx, newThread); err != nil {
		s.rollbackForkedThread(ctx, newThread.ID, newThread.WorktreeDir, projectDir)
		return nil, fmt.Errorf("save thread: %w", err)
	}

	cloned := make([]*store.ChatMessage, 0, len(slice))
	for _, m := range slice {
		if m == nil {
			continue
		}
		cm, err := cloneChatMessageForNewThread(m, newThread.ID)
		if err != nil {
			s.rollbackForkedThread(ctx, newThread.ID, newThread.WorktreeDir, projectDir)
			return nil, fmt.Errorf("clone message: %w", err)
		}
		if err := cm.Validate(); err != nil {
			s.rollbackForkedThread(ctx, newThread.ID, newThread.WorktreeDir, projectDir)
			return nil, fmt.Errorf("invalid message %s: %w", m.ID, err)
		}
		cloned = append(cloned, cm)
	}
	if len(cloned) == 0 {
		s.rollbackForkedThread(ctx, newThread.ID, newThread.WorktreeDir, projectDir)
		return nil, fmt.Errorf("no messages to copy")
	}
	if err := s.messageStore.Append(ctx, newThread.ID, cloned...); err != nil {
		s.rollbackForkedThread(ctx, newThread.ID, newThread.WorktreeDir, projectDir)
		return nil, fmt.Errorf("save messages: %w", err)
	}
	return newThread, nil
}

func (s *Service) rollbackForkedThread(ctx context.Context, threadID, worktreeDir, projectDir string) {
	_ = s.threadStore.Delete(ctx, threadID)
	wd := strings.TrimSpace(worktreeDir)
	pd := strings.TrimSpace(projectDir)
	if wd != "" && pd != "" {
		if _, err := runGit(ctx, pd, "worktree", "remove", "--force", wd); err != nil {
			slog.Warn("rollback fork: remove worktree", "dir", wd, "error", err)
		}
	}
}

func (s *Service) GetThread(ctx context.Context, id string) (*store.Thread, error) {
	return s.threadStore.Get(ctx, id)
}

func (s *Service) RenameThread(ctx context.Context, id, title string) error {
	thread, err := s.threadStore.Get(ctx, id)
	if err != nil {
		return fmt.Errorf("get thread: %w", err)
	}
	thread.Title = title
	return s.threadStore.Update(ctx, thread)
}

// DeleteThread removes the thread and its messages from storage immediately. When removeWorktree is true and the
// thread has a git worktree, `git worktree remove` runs in the background (same idea as DeleteProject + disk cleanup)
// so the UI returns without waiting on git.
func (s *Service) DeleteThread(ctx context.Context, threadID string, removeWorktree bool) error {
	thread, err := s.threadStore.Get(ctx, threadID)
	if err != nil {
		return fmt.Errorf("get thread: %w", err)
	}
	if thread == nil {
		return fmt.Errorf("thread not found")
	}
	project, err := s.projectStore.Get(ctx, thread.ProjectID)
	if err != nil {
		return fmt.Errorf("get project: %w", err)
	}
	if project == nil {
		return fmt.Errorf("project not found")
	}
	worktreeDir := strings.TrimSpace(thread.WorktreeDir)
	projectDir := strings.TrimSpace(project.Directory)
	doAsyncRemove := removeWorktree && worktreeDir != "" && projectDir != ""

	if err := s.threadStore.Delete(ctx, threadID); err != nil {
		return err
	}

	if doAsyncRemove {
		dir := projectDir
		wt := worktreeDir
		tid := threadID
		go func() {
			if _, err := runGit(context.Background(), dir, "worktree", "remove", "--force", wt); err != nil {
				slog.Warn("failed to remove git worktree after thread delete", "thread_id", tid, "dir", wt, "error", err)
			}
		}()
	}
	return nil
}

// SetThreadChatProvider persists which chat provider this thread uses (e.g. "openrouter").
func (s *Service) SetThreadChatProvider(ctx context.Context, threadID, provider string) error {
	provider = strings.TrimSpace(provider)
	if provider == "" {
		return fmt.Errorf("provider is required")
	}
	if provider != "openrouter" && provider != "cursor" && provider != "claude" {
		return fmt.Errorf("unsupported chat provider: %q", provider)
	}
	thread, err := s.threadStore.Get(ctx, threadID)
	if err != nil {
		return fmt.Errorf("get thread: %w", err)
	}
	if thread == nil {
		return fmt.Errorf("thread not found")
	}
	thread.ChatProvider = provider
	return s.threadStore.Update(ctx, thread)
}

// SetThreadChatModel persists the model id for this thread (e.g. OpenRouter model slug).
func (s *Service) SetThreadChatModel(ctx context.Context, threadID, model string) error {
	model = strings.TrimSpace(model)
	if len(model) > 256 {
		return fmt.Errorf("model id too long")
	}
	thread, err := s.threadStore.Get(ctx, threadID)
	if err != nil {
		return fmt.Errorf("get thread: %w", err)
	}
	if thread == nil {
		return fmt.Errorf("thread not found")
	}
	thread.ChatModel = model
	return s.threadStore.Update(ctx, thread)
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
