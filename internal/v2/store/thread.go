package store

import (
	"context"
	"time"
)

type Thread struct {
	ID        string
	ProjectID string

	Title        string
	WorktreeDir  string
	ChatProvider string
	ChatModel    string

	CreatedAt time.Time
	UpdatedAt time.Time
}

type ThreadStore interface {
	Store[Thread]

	ListByProject(ctx context.Context, projectID []byte) ([]*Thread, error)
}
