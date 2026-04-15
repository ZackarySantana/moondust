package service

import (
	"context"
	"fmt"
	"moondust/internal/chat"
	"moondust/internal/cursorcli"
	"moondust/internal/store"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
)

// ListCursorChatModels returns selectable models from `agent --list-models`.
func (s *Service) ListCursorChatModels(ctx context.Context) ([]store.OpenRouterChatModel, error) {
	return cursorcli.ListChatModels(ctx)
}

func (s *Service) streamAssistantCursor(
	ctx context.Context,
	threadID string,
	thread *store.Thread,
	project *store.Project,
	onDelta func(string) error,
	onReasoningDelta func(string) error,
	onToolRound func([]store.OpenRouterToolCallRecord) error,
) error {
	_ = onReasoningDelta

	agentPath, err := cursorcli.LookAgent()
	if err != nil {
		return fmt.Errorf("Cursor Agent CLI (`agent`) not found on PATH. Install from https://cursor.com/install")
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
		model = "composer-2-fast"
	}

	system := chat.WithWorkspaceDir(chat.DefaultSystemPrompt, workDir)
	prompt := chat.BuildCLIStylePrompt(system, history)

	var usageBefore *store.CursorUsageSnapshot
	if u, err := cursorcli.FetchCurrentPeriodUsage(ctx); err == nil {
		usageBefore = u
	}

	var toolRecords []store.OpenRouterToolCallRecord
	onTool := func(round []store.OpenRouterToolCallRecord) error {
		toolRecords = append(toolRecords, round...)
		if onToolRound != nil {
			return onToolRound(round)
		}
		return nil
	}

	final, usage, err := cursorcli.StreamPrintHeadless(ctx, agentPath, workDir, model, prompt, onDelta, onTool)
	if err != nil {
		return err
	}
	final = strings.TrimSpace(final)
	if final == "" {
		return fmt.Errorf("cursor agent: empty assistant reply")
	}

	now := time.Now().UTC()
	replyMessage := &store.ChatMessage{
		ID:           uuid.New().String(),
		ThreadID:     threadID,
		Role:         "assistant",
		Content:      final,
		CreatedAt:    now,
		ChatProvider: "cursor",
		ChatModel:    model,
	}
	var usageAfter *store.CursorUsageSnapshot
	if u, err := cursorcli.FetchCurrentPeriodUsage(ctx); err == nil {
		usageAfter = u
	}

	var cur *store.CursorChatMessageMetadata
	if usage != nil || (usageBefore != nil && usageAfter != nil) {
		cur = &store.CursorChatMessageMetadata{}
		if usage != nil {
			if usage.InputTokens > 0 {
				v := usage.InputTokens
				cur.InputTokens = &v
			}
			if usage.OutputTokens > 0 {
				v := usage.OutputTokens
				cur.OutputTokens = &v
			}
			if usage.CacheReadTokens > 0 {
				v := usage.CacheReadTokens
				cur.CacheReadTokens = &v
			}
			if usage.CacheWriteTokens > 0 {
				v := usage.CacheWriteTokens
				cur.CacheWriteTokens = &v
			}
			if usage.RequestID != "" {
				cur.RequestID = usage.RequestID
			}
		}
		if usageBefore != nil && usageAfter != nil {
			if d := percentPointDelta(usageBefore.AutoPercentUsed, usageAfter.AutoPercentUsed); d != nil {
				cur.PlanAutoPercentDelta = d
			}
			if d := percentPointDelta(usageBefore.APIPercentUsed, usageAfter.APIPercentUsed); d != nil {
				cur.PlanAPIPercentDelta = d
			}
		}
	}
	if len(toolRecords) > 0 {
		if cur == nil {
			cur = &store.CursorChatMessageMetadata{}
		}
		cur.ToolCalls = toolRecords
	}
	if cursorChatMetadataNonEmpty(cur) {
		replyMessage.Metadata = &store.ChatMessageMetadata{Cursor: cur}
	}
	if err := replyMessage.Validate(); err != nil {
		return err
	}
	if err := s.messageStore.Append(ctx, threadID, replyMessage); err != nil {
		return fmt.Errorf("append assistant message: %w", err)
	}
	return nil
}

func percentPointDelta(before, after *float64) *float64 {
	if before == nil || after == nil {
		return nil
	}
	d := *after - *before
	return &d
}

func cursorChatMetadataNonEmpty(cur *store.CursorChatMessageMetadata) bool {
	if cur == nil {
		return false
	}
	return cur.InputTokens != nil || cur.OutputTokens != nil || cur.CacheReadTokens != nil || cur.CacheWriteTokens != nil ||
		cur.RequestID != "" || cur.PlanAutoPercentDelta != nil || cur.PlanAPIPercentDelta != nil || len(cur.ToolCalls) > 0
}
