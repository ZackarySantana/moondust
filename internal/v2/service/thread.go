package service

import (
	"context"
	"crypto/rand"
	"fmt"
	"strings"

	"moondust/internal/v2/store"
)

type Thread struct {
	stores *store.Stores
}

func NewThread(stores *store.Stores) *Thread {
	return &Thread{
		stores: stores,
	}
}

func (t *Thread) Get(ctx context.Context, id string) (*store.Thread, error) {
	return t.stores.Thread.Get(ctx, []byte(id))
}

func (t *Thread) ListByProject(ctx context.Context, projectID string) ([]*store.Thread, error) {
	return t.stores.Thread.ListByProject(ctx, []byte(projectID))
}

func (t *Thread) List(ctx context.Context) ([]*store.Thread, error) {
	return t.stores.Thread.List(ctx)
}

func (t *Thread) Rename(ctx context.Context, id string, title string) error {
	thread, err := t.stores.Thread.Get(ctx, []byte(id))
	if err != nil {
		return err
	}
	thread.Title = title
	return t.stores.Thread.Update(ctx, []byte(id), thread)
}

func (t *Thread) Create(ctx context.Context, projectID, title string) (*store.Thread, error) {
	pid := strings.TrimSpace(projectID)
	if pid == "" {
		return nil, fmt.Errorf("project is required")
	}
	if _, err := t.stores.Project.Get(ctx, []byte(pid)); err != nil {
		return nil, fmt.Errorf("project: %w", err)
	}
	id := rand.Text()
	out := &store.Thread{
		ID:           id,
		ProjectID:    pid,
		Title:        strings.TrimSpace(title),
		WorktreeDir:  "",
		ChatProvider: "Cursor Agent",
		ChatModel:    "claude-sonnet-4.6",
	}
	if err := t.stores.Thread.Put(ctx, []byte(id), out); err != nil {
		return nil, fmt.Errorf("save thread: %w", err)
	}
	return out, nil
}
