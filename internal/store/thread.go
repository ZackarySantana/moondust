package store

import (
	"context"
	"errors"
	"time"
)

type Thread struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"project_id"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"created_at"`
}

func (t *Thread) Validate() error {
	if t.ID == "" {
		return errors.New("id is required")
	}
	if t.ProjectID == "" {
		return errors.New("project_id is required")
	}
	return nil
}

type ChatMessage struct {
	ID        string    `json:"id"`
	ThreadID  string    `json:"thread_id"`
	Role      string    `json:"role"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

func (m *ChatMessage) Validate() error {
	if m.ID == "" {
		return errors.New("id is required")
	}
	if m.ThreadID == "" {
		return errors.New("thread_id is required")
	}
	if m.Role != "user" && m.Role != "assistant" {
		return errors.New("role must be user or assistant")
	}
	if m.Content == "" {
		return errors.New("content is required")
	}
	return nil
}

type GitStatus struct {
	Branch  string   `json:"branch"`
	Entries []string `json:"entries"`
}

type ThreadStore interface {
	Get(ctx context.Context, id string) (*Thread, error)
	List(ctx context.Context) ([]*Thread, error)
	ListByProject(ctx context.Context, projectID string) ([]*Thread, error)
	Update(ctx context.Context, thread *Thread) error
	Delete(ctx context.Context, id string) error
}

type MessageStore interface {
	ListByThread(ctx context.Context, threadID string) ([]*ChatMessage, error)
	Append(ctx context.Context, threadID string, messages ...*ChatMessage) error
}
