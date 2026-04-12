package store

import (
	"context"
	"encoding/json"
	"errors"
	"time"
)

type Thread struct {
	ID          string    `json:"id"`
	ProjectID   string    `json:"project_id"`
	Title       string    `json:"title"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	WorktreeDir string    `json:"worktree_dir"`
	// ChatProvider is which upstream powers this thread (e.g. "openrouter"). Empty treated as "openrouter" in the UI.
	ChatProvider string `json:"chat_provider,omitempty"`
	// ChatModel is the provider-specific model id (e.g. OpenRouter's "openai/gpt-4o-mini"). Empty means not chosen yet.
	ChatModel string `json:"chat_model,omitempty"`
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

// ChatMessageMetadata holds optional, provider-specific fields for a single message. Extend with new sub-structs per provider.
type ChatMessageMetadata struct {
	OpenRouter *OpenRouterChatMessageMetadata `json:"openrouter,omitempty"`
}

// OpenRouterChatMessageMetadata is usage/cost data returned by OpenRouter on streaming completions (aggregated across tool rounds).
type OpenRouterChatMessageMetadata struct {
	PromptTokens     *int     `json:"prompt_tokens,omitempty"`
	CompletionTokens *int     `json:"completion_tokens,omitempty"`
	TotalTokens      *int     `json:"total_tokens,omitempty"`
	CostUSD          *float64 `json:"cost_usd,omitempty"`
}

type ChatMessage struct {
	ID        string    `json:"id"`
	ThreadID  string    `json:"thread_id"`
	Role      string    `json:"role"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	// ChatProvider and ChatModel record which stack produced an assistant reply (e.g. openrouter + openai/gpt-4o-mini).
	ChatProvider string               `json:"chat_provider,omitempty"`
	ChatModel    string               `json:"chat_model,omitempty"`
	Metadata     *ChatMessageMetadata `json:"metadata,omitempty"`
}

// UnmarshalJSON merges legacy openrouter_cost_usd into Metadata.openrouter.cost_usd when metadata is absent.
func (m *ChatMessage) UnmarshalJSON(data []byte) error {
	var raw struct {
		ID           string               `json:"id"`
		ThreadID     string               `json:"thread_id"`
		Role         string               `json:"role"`
		Content      string               `json:"content"`
		CreatedAt    time.Time            `json:"created_at"`
		ChatProvider string               `json:"chat_provider,omitempty"`
		ChatModel    string               `json:"chat_model,omitempty"`
		Metadata     *ChatMessageMetadata `json:"metadata,omitempty"`
		LegacyCost   *float64             `json:"openrouter_cost_usd,omitempty"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	m.ID = raw.ID
	m.ThreadID = raw.ThreadID
	m.Role = raw.Role
	m.Content = raw.Content
	m.CreatedAt = raw.CreatedAt
	m.ChatProvider = raw.ChatProvider
	m.ChatModel = raw.ChatModel
	m.Metadata = raw.Metadata
	if m.Metadata == nil && raw.LegacyCost != nil {
		m.Metadata = &ChatMessageMetadata{
			OpenRouter: &OpenRouterChatMessageMetadata{
				CostUSD: raw.LegacyCost,
			},
		}
	}
	return nil
}

// OpenRouterChatModel is a selectable model from the OpenRouter /api/v1/models list (chat + tools).
type OpenRouterChatModel struct {
	ID                string `json:"id"`
	Name              string `json:"name"`
	Provider          string `json:"provider"`           // Slug before the first "/" in id (e.g. openai).
	Description       string `json:"description"`        // One-line preview for pickers; "TBA" if missing.
	DescriptionFull   string `json:"description_full"`   // Full API description for detail UI; same as Description when short.
	PricingTier       string `json:"pricing_tier"`       // Relative cost hint, e.g. "$$" or "Free".
	PricingPrompt     string `json:"pricing_prompt"`     // Raw per-token USD string from OpenRouter (input).
	PricingCompletion string `json:"pricing_completion"` // Raw per-token USD string (output).
	PricingSummary    string `json:"pricing_summary"`    // Human-readable input/output pricing for the model card.
	Vision            bool   `json:"vision"`             // Accepts image (or video) input.
	Reasoning         bool   `json:"reasoning"`          // Supports reasoning-style parameters.
	LongContext       bool   `json:"long_context"`       // Large context window.
	ContextLength     int    `json:"context_length"`     // Raw context_length from the API.
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

type GitFileChange struct {
	Path   string `json:"path"`
	Status string `json:"status"`
}

type GitCommitSummary struct {
	Hash      string `json:"hash"`
	Subject   string `json:"subject"`
	Author    string `json:"author"`
	When      string `json:"when"`
	ExactDate string `json:"exact_date"`
}

type GitReview struct {
	Branch       string             `json:"branch"`
	Ahead        int                `json:"ahead"`
	Behind       int                `json:"behind"`
	RemoteURL    string             `json:"remote_url"`
	Staged       []GitFileChange    `json:"staged"`
	Unstaged     []GitFileChange    `json:"unstaged"`
	Untracked    []GitFileChange    `json:"untracked"`
	LocalCommits []GitCommitSummary `json:"local_commits"`
	MainCommits  []GitCommitSummary `json:"main_commits"`
	DiffStat     string             `json:"diff_stat"`
	PatchPreview string             `json:"patch_preview"`
}

type FileDiff struct {
	Path     string `json:"path"`
	Language string `json:"language"`
	Original string `json:"original"`
	Modified string `json:"modified"`
}

type ThreadStore interface {
	Get(ctx context.Context, id string) (*Thread, error)
	List(ctx context.Context) ([]*Thread, error)
	ListByProject(ctx context.Context, projectID string) ([]*Thread, error)
	Update(ctx context.Context, thread *Thread) error
	Delete(ctx context.Context, id string) error
}

var _ ThreadStore = (*TouchThreadStore)(nil)

// TouchThreadStore wraps a ThreadStore and automatically sets UpdatedAt on every Update call.
type TouchThreadStore struct {
	ThreadStore ThreadStore
}

func (s *TouchThreadStore) Get(ctx context.Context, id string) (*Thread, error) {
	return s.ThreadStore.Get(ctx, id)
}

func (s *TouchThreadStore) List(ctx context.Context) ([]*Thread, error) {
	return s.ThreadStore.List(ctx)
}

func (s *TouchThreadStore) ListByProject(ctx context.Context, projectID string) ([]*Thread, error) {
	return s.ThreadStore.ListByProject(ctx, projectID)
}

func (s *TouchThreadStore) Update(ctx context.Context, thread *Thread) error {
	thread.UpdatedAt = time.Now().UTC()
	return s.ThreadStore.Update(ctx, thread)
}

func (s *TouchThreadStore) Delete(ctx context.Context, id string) error {
	return s.ThreadStore.Delete(ctx, id)
}

type MessageStore interface {
	ListByThread(ctx context.Context, threadID string) ([]*ChatMessage, error)
	Append(ctx context.Context, threadID string, messages ...*ChatMessage) error
}
