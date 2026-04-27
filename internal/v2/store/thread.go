package store

import (
	"context"
	"time"
)

type Thread struct {
	ID          string
	WorkspaceID string

	Title        string
	WorktreeDir  string
	ChatProvider string
	ChatModel    string

	CreatedAt time.Time
	UpdatedAt time.Time
}

type ThreadStore interface {
	Store[Thread]

	ListByWorkspace(ctx context.Context, workspaceID []byte) ([]*Thread, error)
}
