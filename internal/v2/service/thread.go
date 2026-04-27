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

func (t *Thread) ListByWorkspace(ctx context.Context, workspaceID string) ([]*store.Thread, error) {
	return t.stores.Thread.ListByWorkspace(ctx, []byte(workspaceID))
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

func (t *Thread) Create(ctx context.Context, workspaceID, title string) (*store.Thread, error) {
	wid := strings.TrimSpace(workspaceID)
	if wid == "" {
		return nil, fmt.Errorf("workspace is required")
	}
	if _, err := t.stores.Workspace.Get(ctx, []byte(wid)); err != nil {
		return nil, fmt.Errorf("workspace: %w", err)
	}
	id := rand.Text()
	out := &store.Thread{
		ID:           id,
		WorkspaceID:  wid,
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
