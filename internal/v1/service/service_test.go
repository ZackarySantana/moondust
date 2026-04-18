package service

import (
	"context"
	"testing"
	"time"

	"moondust/internal/v1/store"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type forkTestThreadStore struct {
	threads map[string]*store.Thread
}

func (s *forkTestThreadStore) Get(ctx context.Context, id string) (*store.Thread, error) {
	return s.threads[id], nil
}

func (s *forkTestThreadStore) List(ctx context.Context) ([]*store.Thread, error) {
	out := make([]*store.Thread, 0, len(s.threads))
	for _, t := range s.threads {
		out = append(out, t)
	}
	return out, nil
}

func (s *forkTestThreadStore) ListByProject(ctx context.Context, projectID string) ([]*store.Thread, error) {
	var out []*store.Thread
	for _, t := range s.threads {
		if t.ProjectID == projectID {
			out = append(out, t)
		}
	}
	return out, nil
}

func (s *forkTestThreadStore) Update(ctx context.Context, thread *store.Thread) error {
	s.threads[thread.ID] = thread
	return nil
}

func (s *forkTestThreadStore) Delete(ctx context.Context, id string) error {
	delete(s.threads, id)
	return nil
}

type forkTestProjectStore struct {
	projects map[string]*store.Project
}

func (s *forkTestProjectStore) Get(ctx context.Context, id string) (*store.Project, error) {
	return s.projects[id], nil
}

func (s *forkTestProjectStore) List(ctx context.Context) ([]*store.Project, error) {
	out := make([]*store.Project, 0, len(s.projects))
	for _, p := range s.projects {
		out = append(out, p)
	}
	return out, nil
}

func (s *forkTestProjectStore) Update(ctx context.Context, project *store.Project) error {
	s.projects[project.ID] = project
	return nil
}

func (s *forkTestProjectStore) Delete(ctx context.Context, id string) error {
	delete(s.projects, id)
	return nil
}

type forkTestMessageStore struct {
	byThread map[string][]*store.ChatMessage
}

func (s *forkTestMessageStore) ListByThread(ctx context.Context, threadID string) ([]*store.ChatMessage, error) {
	return s.byThread[threadID], nil
}

func (s *forkTestMessageStore) Append(ctx context.Context, threadID string, messages ...*store.ChatMessage) error {
	s.byThread[threadID] = append(s.byThread[threadID], messages...)
	return nil
}

type forkTestSettingsStore struct{}

func (forkTestSettingsStore) Get(ctx context.Context) (*store.Settings, error) {
	return &store.Settings{}, nil
}

func (forkTestSettingsStore) Save(ctx context.Context, s *store.Settings) error {
	return nil
}

func TestForkThreadAtMessage(t *testing.T) {
	ctx := context.Background()
	now := time.Now().UTC()

	t.Run("errors_when_message_missing_chat_provider", func(t *testing.T) {
		pid := "proj-fork-1"
		srcTid := "thread-src-1"
		dir := t.TempDir()
		project := &store.Project{
			ID:            pid,
			Name:          "P",
			Directory:     dir,
			DefaultBranch: "main",
			AutoFetch:     "off",
		}
		source := &store.Thread{
			ID:           srcTid,
			ProjectID:    pid,
			Title:        "Hi",
			CreatedAt:    now,
			UpdatedAt:    now,
			ChatProvider: "openrouter",
			ChatModel:    "openai/gpt-4o-mini",
		}
		bad := &store.ChatMessage{
			ID:           "msg-bad",
			ThreadID:     srcTid,
			Role:         "user",
			Content:      "hello",
			CreatedAt:    now,
			ChatProvider: "",
		}
		svc := New(
			&forkTestProjectStore{projects: map[string]*store.Project{pid: project}},
			&forkTestThreadStore{threads: map[string]*store.Thread{srcTid: source}},
			&forkTestMessageStore{byThread: map[string][]*store.ChatMessage{srcTid: {bad}}},
			forkTestSettingsStore{},
		)
		_, err := svc.ForkThreadAtMessage(ctx, srcTid, "msg-bad")
		require.Error(t, err)
		assert.ErrorContains(t, err, "invalid message msg-bad")
		assert.ErrorContains(t, err, "chat_provider is required")
	})

	t.Run("success_copies_valid_messages", func(t *testing.T) {
		pid := "proj-fork-2"
		srcTid := "thread-src-2"
		dir := t.TempDir()
		project := &store.Project{
			ID:            pid,
			Name:          "P2",
			Directory:     dir,
			DefaultBranch: "main",
			AutoFetch:     "off",
		}
		source := &store.Thread{
			ID:           srcTid,
			ProjectID:    pid,
			Title:        "Hi",
			CreatedAt:    now,
			UpdatedAt:    now,
			ChatProvider: "openrouter",
			ChatModel:    "openai/gpt-4o-mini",
		}
		m1 := &store.ChatMessage{
			ID:           "m1",
			ThreadID:     srcTid,
			Role:         "user",
			Content:      "hello",
			CreatedAt:    now,
			ChatProvider: "openrouter",
		}
		m2 := &store.ChatMessage{
			ID:           "m2",
			ThreadID:     srcTid,
			Role:         "assistant",
			Content:      "hi",
			CreatedAt:    now,
			ChatProvider: "openrouter",
			ChatModel:    "openai/gpt-4o-mini",
		}
		threads := &forkTestThreadStore{threads: map[string]*store.Thread{srcTid: source}}
		msgs := &forkTestMessageStore{byThread: map[string][]*store.ChatMessage{srcTid: {m1, m2}}}
		svc := New(
			&forkTestProjectStore{projects: map[string]*store.Project{pid: project}},
			threads,
			msgs,
			forkTestSettingsStore{},
		)
		newThread, err := svc.ForkThreadAtMessage(ctx, srcTid, "m2")
		require.NoError(t, err)
		require.NotNil(t, newThread)
		assert.NotEqual(t, srcTid, newThread.ID)
		copied, err := msgs.ListByThread(ctx, newThread.ID)
		require.NoError(t, err)
		require.Len(t, copied, 2)
		assert.Equal(t, "openrouter", copied[0].ChatProvider)
		assert.Equal(t, "openrouter", copied[1].ChatProvider)
		assert.Equal(t, newThread.ID, copied[0].ThreadID)
		assert.Equal(t, newThread.ID, copied[1].ThreadID)
	})
}
