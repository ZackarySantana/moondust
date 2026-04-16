package store

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"
)

type Thread struct {
	ID          string    `json:"id"`
	ProjectID   string    `json:"project_id"`
	Title       string    `json:"title"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	WorktreeDir string    `json:"worktree_dir"`
	// ChatProvider is which upstream powers this thread (e.g. "openrouter" or "cursor").
	ChatProvider string `json:"chat_provider"`
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
	cp := strings.TrimSpace(t.ChatProvider)
	if cp == "" {
		return errors.New("chat_provider is required")
	}
	if cp != "openrouter" && cp != "cursor" && cp != "claude" {
		return fmt.Errorf("unsupported chat_provider %q", cp)
	}
	return nil
}

// ChatMessageMetadata holds optional, provider-specific fields for a single message. Extend with new sub-structs per provider.
type ChatMessageMetadata struct {
	OpenRouter *OpenRouterChatMessageMetadata `json:"openrouter,omitempty"`
	Cursor     *CursorChatMessageMetadata     `json:"cursor,omitempty"`
	Claude     *ClaudeChatMessageMetadata     `json:"claude,omitempty"`
}

// CursorChatMessageMetadata is usage / request metadata for Cursor Agent CLI (`agent --print`) turns.
type CursorChatMessageMetadata struct {
	InputTokens      *int   `json:"input_tokens,omitempty"`
	OutputTokens     *int   `json:"output_tokens,omitempty"`
	CacheReadTokens  *int   `json:"cache_read_tokens,omitempty"`
	CacheWriteTokens *int   `json:"cache_write_tokens,omitempty"`
	RequestID        string `json:"request_id,omitempty"`
	// PlanAutoPercentDelta and PlanAPIPercentDelta are the change in Cursor dashboard
	// plan-usage percentages (Auto vs API buckets) measured immediately before and after
	// this turn. Best-effort: other concurrent Cursor usage can skew the delta.
	PlanAutoPercentDelta *float64 `json:"plan_auto_percent_delta,omitempty"`
	PlanAPIPercentDelta  *float64 `json:"plan_api_percent_delta,omitempty"`
	// ToolCalls are best-effort from Cursor stream-json tool_call / completed events (same shape as OpenRouter).
	ToolCalls []OpenRouterToolCallRecord `json:"tool_calls,omitempty"`
}

// ClaudeChatMessageMetadata is usage / request metadata for Claude Code CLI (`claude -p`) turns.
type ClaudeChatMessageMetadata struct {
	InputTokens      *int                       `json:"input_tokens,omitempty"`
	OutputTokens     *int                       `json:"output_tokens,omitempty"`
	CacheReadTokens  *int                       `json:"cache_read_tokens,omitempty"`
	CacheWriteTokens *int                       `json:"cache_write_tokens,omitempty"`
	RequestID        string                     `json:"request_id,omitempty"`
	ToolCalls        []OpenRouterToolCallRecord `json:"tool_calls,omitempty"`
}

// OpenRouterToolCallRecord is one tool invocation from an assistant turn (persisted for history).
type OpenRouterToolCallRecord struct {
	ID        string `json:"id,omitempty"`
	Name      string `json:"name"`
	Arguments string `json:"arguments,omitempty"`
	// Output is the workspace tool result string (truncated when stored).
	Output string `json:"output,omitempty"`
}

// AssistantTurnSegment is one ordered piece of an assistant reply: markdown text or a tool invocation.
// Exactly one of Text or Tool should be set.
type AssistantTurnSegment struct {
	Text string                    `json:"text,omitempty"`
	Tool *OpenRouterToolCallRecord `json:"tool,omitempty"`
}

// OpenRouterChatMessageMetadata is usage/cost data returned by OpenRouter on streaming completions (aggregated across tool rounds).
type OpenRouterChatMessageMetadata struct {
	PromptTokens     *int     `json:"prompt_tokens,omitempty"`
	CompletionTokens *int     `json:"completion_tokens,omitempty"`
	TotalTokens      *int     `json:"total_tokens,omitempty"`
	CostUSD          *float64 `json:"cost_usd,omitempty"`
	// Reasoning is the model's streamed reasoning / thinking trace when the provider exposes it (e.g. OpenRouter delta.reasoning).
	Reasoning *string `json:"reasoning,omitempty"`
	// ReasoningDurationSec is the wall-clock seconds from the first reasoning token to the first response token.
	ReasoningDurationSec *float64 `json:"reasoning_duration_sec,omitempty"`
	// Segments interleaves streamed text and tool calls in execution order (set when any tool ran).
	Segments []AssistantTurnSegment `json:"segments,omitempty"`
}

type ChatMessage struct {
	ID        string    `json:"id"`
	ThreadID  string    `json:"thread_id"`
	Role      string    `json:"role"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	// ChatProvider is which upstream produced this message (same as the thread for user turns; assistant sets explicitly).
	ChatProvider string               `json:"chat_provider"`
	ChatModel    string               `json:"chat_model,omitempty"`
	Metadata     *ChatMessageMetadata `json:"metadata,omitempty"`
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
	cp := strings.TrimSpace(m.ChatProvider)
	if cp == "" {
		return errors.New("chat_provider is required")
	}
	if cp != "openrouter" && cp != "cursor" && cp != "claude" {
		return fmt.Errorf("unsupported chat_provider %q", cp)
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
