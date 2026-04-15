package service

import (
	"context"
	"fmt"
	"moondust/internal/chat"
	"moondust/internal/claudecli"
	"moondust/internal/store"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
)

// ListClaudeChatModels returns the Claude Code model catalog (static aliases).
func (s *Service) ListClaudeChatModels(ctx context.Context) ([]store.OpenRouterChatModel, error) {
	_ = ctx
	return claudecli.DefaultChatModels(), nil
}

func (s *Service) streamAssistantClaude(
	ctx context.Context,
	threadID string,
	thread *store.Thread,
	project *store.Project,
	onDelta func(string) error,
	onReasoningDelta func(string) error,
	onToolRound func([]store.OpenRouterToolCallRecord) error,
) error {
	_ = onReasoningDelta

	claudePath, err := claudecli.LookClaude()
	if err != nil {
		return fmt.Errorf("Claude Code CLI (`claude`) not found on PATH. Install from https://docs.anthropic.com/en/docs/claude-code")
	}

	workDir := strings.TrimSpace(project.Directory)
	if wd := strings.TrimSpace(thread.WorktreeDir); wd != "" {
		workDir = wd
	}
	if workDir == "" {
		return fmt.Errorf("no workspace directory for thread")
	}

	history, err := s.messageStore.ListByThread(ctx, threadID)
	if err != nil {
		return fmt.Errorf("list thread messages: %w", err)
	}
	sort.Slice(history, func(i, j int) bool {
		return history[i].CreatedAt.Before(history[j].CreatedAt)
	})

	model := strings.TrimSpace(thread.ChatModel)
	if model == "" {
		model = "sonnet"
	}

	system := chat.WithWorkspaceDir(chat.DefaultSystemPrompt, workDir)
	prompt := chat.BuildCLIStylePrompt(system, history)

	var toolRecords []store.OpenRouterToolCallRecord
	onTool := func(round []store.OpenRouterToolCallRecord) error {
		toolRecords = append(toolRecords, round...)
		if onToolRound != nil {
			return onToolRound(round)
		}
		return nil
	}

	final, usage, err := claudecli.StreamPrintHeadless(ctx, claudePath, workDir, model, prompt, onDelta, onTool)
	if err != nil {
		return err
	}
	final = strings.TrimSpace(final)
	if final == "" {
		return fmt.Errorf("claude code: empty assistant reply")
	}

	now := time.Now().UTC()
	replyMessage := &store.ChatMessage{
		ID:           uuid.New().String(),
		ThreadID:     threadID,
		Role:         "assistant",
		Content:      final,
		CreatedAt:    now,
		ChatProvider: "claude",
		ChatModel:    model,
	}

	var meta *store.ClaudeChatMessageMetadata
	if usage != nil {
		meta = &store.ClaudeChatMessageMetadata{}
		if usage.InputTokens > 0 {
			v := usage.InputTokens
			meta.InputTokens = &v
		}
		if usage.OutputTokens > 0 {
			v := usage.OutputTokens
			meta.OutputTokens = &v
		}
		if usage.CacheReadTokens > 0 {
			v := usage.CacheReadTokens
			meta.CacheReadTokens = &v
		}
		if usage.CacheWriteTokens > 0 {
			v := usage.CacheWriteTokens
			meta.CacheWriteTokens = &v
		}
		if usage.RequestID != "" {
			meta.RequestID = usage.RequestID
		}
	}
	if len(toolRecords) > 0 {
		if meta == nil {
			meta = &store.ClaudeChatMessageMetadata{}
		}
		meta.ToolCalls = toolRecords
	}
	if claudeChatMetadataNonEmpty(meta) {
		replyMessage.Metadata = &store.ChatMessageMetadata{Claude: meta}
	}
	if err := replyMessage.Validate(); err != nil {
		return err
	}
	if err := s.messageStore.Append(ctx, threadID, replyMessage); err != nil {
		return fmt.Errorf("append assistant message: %w", err)
	}
	return nil
}

func claudeChatMetadataNonEmpty(m *store.ClaudeChatMessageMetadata) bool {
	if m == nil {
		return false
	}
	return m.InputTokens != nil || m.OutputTokens != nil || m.CacheReadTokens != nil || m.CacheWriteTokens != nil ||
		m.RequestID != "" || len(m.ToolCalls) > 0
}
