package service

import (
	"context"
	"fmt"
	"moondust/internal/chat"
	"moondust/internal/claudecli"
	"moondust/internal/cursorcli"
	"moondust/internal/openrouter"
	"moondust/internal/rand"
	"moondust/internal/store"
	"moondust/internal/workspace"
	"sort"
	"strings"
	"time"
)

func (s *Service) ListThreadMessages(ctx context.Context, threadID string) ([]*store.ChatMessage, error) {
	if _, err := s.threadStore.Get(ctx, threadID); err != nil {
		return nil, fmt.Errorf("get thread: %w", err)
	}
	return s.messageStore.ListByThread(ctx, threadID)
}

// SendThreadMessage saves the user message only and returns it. The caller should run StreamAssistantReply to generate the assistant (e.g. in a goroutine with streaming events).
func (s *Service) SendThreadMessage(ctx context.Context, threadID, content string) ([]*store.ChatMessage, error) {
	thread, err := s.threadStore.Get(ctx, threadID)
	if err != nil {
		return nil, fmt.Errorf("get thread: %w", err)
	}
	if thread == nil {
		return nil, fmt.Errorf("thread not found")
	}

	trimmed := strings.TrimSpace(content)
	if trimmed == "" {
		return nil, fmt.Errorf("message cannot be empty")
	}

	st, err := s.settingsStore.Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("load settings: %w", err)
	}
	if st == nil {
		st = &store.Settings{}
	}
	provider := strings.TrimSpace(thread.ChatProvider)
	if provider == "" {
		return nil, fmt.Errorf("thread has no chat_provider set")
	}
	if provider != "openrouter" && provider != "cursor" && provider != "claude" {
		return nil, fmt.Errorf("unsupported chat provider %q", provider)
	}

	if provider == "cursor" {
		if _, err := cursorcli.LookAgent(); err != nil {
			return nil, fmt.Errorf("Cursor Agent CLI (`agent`) not found on PATH. Install from https://cursor.com/install")
		}
	} else if provider == "claude" {
		if _, err := claudecli.LookClaude(); err != nil {
			return nil, fmt.Errorf("Claude Code CLI (`claude`) not found on PATH. Install from https://docs.anthropic.com/en/docs/claude-code")
		}
	} else {
		apiKey := strings.TrimSpace(st.OpenRouterAPIKey)
		if apiKey == "" {
			return nil, fmt.Errorf("add an OpenRouter API key in Settings → Providers")
		}
	}

	now := time.Now().UTC()
	userMessage := &store.ChatMessage{
		ID:           rand.Text(),
		ThreadID:     threadID,
		Role:         "user",
		Content:      trimmed,
		CreatedAt:    now,
		ChatProvider: provider,
		ChatModel:    strings.TrimSpace(thread.ChatModel),
	}
	if err := userMessage.Validate(); err != nil {
		return nil, err
	}

	if err := s.messageStore.Append(ctx, threadID, userMessage); err != nil {
		return nil, fmt.Errorf("append user message: %w", err)
	}

	if thread.Title == "New thread" {
		runes := []rune(trimmed)
		if len(runes) > 48 {
			runes = runes[:48]
		}
		thread.Title = string(runes)
	}
	if err := s.threadStore.Update(ctx, thread); err != nil {
		return nil, fmt.Errorf("update thread: %w", err)
	}

	return []*store.ChatMessage{userMessage}, nil
}

// StreamAssistantReply loads the thread transcript (including the latest user message), streams the model reply, and appends the assistant message on success.
// onReasoningDelta is optional; when non-nil, receives streamed reasoning / thinking tokens when the API sends them.
// onToolRound is optional; when non-nil, called after each tool batch with persisted records (for live UI).
func (s *Service) StreamAssistantReply(ctx context.Context, threadID string, onDelta func(string) error, onReasoningDelta func(string) error, onToolRound func([]store.OpenRouterToolCallRecord) error) error {
	thread, project, err := s.resolveThreadProject(ctx, threadID)
	if err != nil {
		return err
	}

	st, err := s.settingsStore.Get(ctx)
	if err != nil {
		return fmt.Errorf("load settings: %w", err)
	}
	if st == nil {
		st = &store.Settings{}
	}

	provider := strings.TrimSpace(thread.ChatProvider)
	if provider == "" {
		return fmt.Errorf("thread has no chat_provider set")
	}
	if provider != "openrouter" && provider != "cursor" && provider != "claude" {
		return fmt.Errorf("unsupported chat provider %q", provider)
	}

	if provider == "cursor" {
		return s.streamAssistantCursor(ctx, threadID, thread, project, onDelta, onReasoningDelta, onToolRound)
	}
	if provider == "claude" {
		return s.streamAssistantClaude(ctx, threadID, thread, project, onDelta, onReasoningDelta, onToolRound)
	}

	apiKey := strings.TrimSpace(st.OpenRouterAPIKey)
	if apiKey == "" {
		return fmt.Errorf("add an OpenRouter API key in Settings → Providers")
	}

	model := strings.TrimSpace(thread.ChatModel)
	if model == "" {
		model = "openai/gpt-4o-mini"
	}

	history, err := s.messageStore.ListByThread(ctx, threadID)
	if err != nil {
		return fmt.Errorf("list thread messages: %w", err)
	}
	sort.Slice(history, func(i, j int) bool {
		return history[i].CreatedAt.Before(history[j].CreatedAt)
	})

	workDir := project.Directory
	if thread.WorktreeDir != "" {
		workDir = thread.WorktreeDir
	}
	system := chat.WithWorkspaceDir(chat.DefaultSystemPrompt, workDir)
	apiMessages := buildOpenRouterMessagesFromHistory(system, history)
	agentTools := store.NormalizeAgentToolsEnabled(st.AgentToolsEnabled)
	tools := openrouter.ChatToolsFromWorkspace(agentTools)

	const maxToolSteps = 8
	// Cap stored JSON per tool call; arguments can be large (e.g. write payload).
	const maxPersistedToolArgLen = 8000
	const maxPersistedToolOutLen = 16000

	var full strings.Builder
	var reasoningFull strings.Builder
	var totalCost float64
	var sawCost bool
	var sumPrompt, sumCompletion, sumTotal int
	var sawTokens bool
	var toolRecords []store.OpenRouterToolCallRecord
	var segments []store.AssistantTurnSegment
	var reasoningStartTime time.Time
	var reasoningDurationSec float64
	var sawReasoningStart bool
	var sawFirstResponseToken bool
	appendSegText := func(round *strings.Builder) {
		t := strings.TrimSpace(round.String())
		if t == "" {
			return
		}
		segments = append(segments, store.AssistantTurnSegment{Text: t})
	}
	for step := 0; step < maxToolSteps; step++ {
		var roundText strings.Builder
		content, calls, usage, err := openrouter.StreamCompletionRound(ctx, apiKey, model, apiMessages, tools, func(delta string) error {
			roundText.WriteString(delta)
			full.WriteString(delta)
			if sawReasoningStart && !sawFirstResponseToken {
				reasoningDurationSec = time.Since(reasoningStartTime).Seconds()
				sawFirstResponseToken = true
			}
			return onDelta(delta)
		}, func(rdelta string) error {
			if rdelta == "" {
				return nil
			}
			if !sawReasoningStart {
				reasoningStartTime = time.Now()
				sawReasoningStart = true
			}
			reasoningFull.WriteString(rdelta)
			if onReasoningDelta != nil {
				return onReasoningDelta(rdelta)
			}
			return nil
		})
		if err != nil {
			return err
		}
		if usage != nil {
			if usage.PromptTokens > 0 || usage.CompletionTokens > 0 || usage.TotalTokens > 0 {
				sumPrompt += usage.PromptTokens
				sumCompletion += usage.CompletionTokens
				sumTotal += usage.TotalTokens
				sawTokens = true
			}
			if usage.CostUSD != nil {
				totalCost += *usage.CostUSD
				sawCost = true
			}
		}
		if len(calls) == 0 {
			_ = content
			appendSegText(&roundText)
			break
		}
		appendSegText(&roundText)
		if step == maxToolSteps-1 {
			return fmt.Errorf("assistant requested tools too many times (max %d rounds)", maxToolSteps)
		}
		apiMessages = append(apiMessages, openrouter.AssistantWithToolCalls(content, calls))
		var roundTools []store.OpenRouterToolCallRecord
		for _, tc := range calls {
			out, terr := workspace.RunTool(workDir, tc.Name, tc.Arguments)
			if terr != nil {
				out = "Error: " + terr.Error()
			}
			args := tc.Arguments
			if len(args) > maxPersistedToolArgLen {
				args = args[:maxPersistedToolArgLen] + "…"
			}
			outPersist := out
			if len(outPersist) > maxPersistedToolOutLen {
				outPersist = outPersist[:maxPersistedToolOutLen] + "…"
			}
			r := store.OpenRouterToolCallRecord{
				ID:        tc.ID,
				Name:      tc.Name,
				Arguments: args,
				Output:    outPersist,
			}
			toolRecords = append(toolRecords, r)
			roundTools = append(roundTools, r)
			apiMessages = append(apiMessages, openrouter.ToolResultMessage(tc.ID, out))
		}
		for i := range roundTools {
			r := roundTools[i]
			segments = append(segments, store.AssistantTurnSegment{Tool: &r})
		}
		if onToolRound != nil && len(roundTools) > 0 {
			if err := onToolRound(roundTools); err != nil {
				return err
			}
		}
	}
	replyText := strings.TrimSpace(full.String())
	if replyText == "" {
		return fmt.Errorf("openrouter: empty assistant reply")
	}

	now := time.Now().UTC()
	replyMessage := &store.ChatMessage{
		ID:           rand.Text(),
		ThreadID:     threadID,
		Role:         "assistant",
		Content:      replyText,
		CreatedAt:    now,
		ChatProvider: provider,
		ChatModel:    model,
	}
	reasoningTrim := strings.TrimSpace(reasoningFull.String())
	if sawTokens || sawCost || reasoningTrim != "" || len(toolRecords) > 0 {
		or := &store.OpenRouterChatMessageMetadata{}
		if sawTokens {
			if sumPrompt > 0 {
				or.PromptTokens = &sumPrompt
			}
			if sumCompletion > 0 {
				or.CompletionTokens = &sumCompletion
			}
			if sumTotal > 0 {
				or.TotalTokens = &sumTotal
			}
		}
		if sawCost {
			c := totalCost
			or.CostUSD = &c
		}
		if reasoningTrim != "" {
			or.Reasoning = &reasoningTrim
			if sawReasoningStart && sawFirstResponseToken {
				dur := reasoningDurationSec
				or.ReasoningDurationSec = &dur
			}
		}
		if len(toolRecords) > 0 {
			or.Segments = segments
		}
		if or.PromptTokens != nil || or.CompletionTokens != nil || or.TotalTokens != nil || or.CostUSD != nil || or.Reasoning != nil || len(or.Segments) > 0 {
			replyMessage.Metadata = &store.ChatMessageMetadata{OpenRouter: or}
		}
	}
	if err := replyMessage.Validate(); err != nil {
		return err
	}
	if err := s.messageStore.Append(ctx, threadID, replyMessage); err != nil {
		return fmt.Errorf("append assistant message: %w", err)
	}
	return nil
}

// buildOpenRouterMessagesFromHistory returns system plus stored turns in order (including the latest user message).
func buildOpenRouterMessagesFromHistory(system string, history []*store.ChatMessage) []openrouter.APIMessage {
	out := make([]openrouter.APIMessage, 0, 1+len(history))
	out = append(out, openrouter.APIMessage{Role: "system", Content: ptrString(system)})
	for _, m := range history {
		switch m.Role {
		case "user", "assistant":
			c := m.Content
			out = append(out, openrouter.APIMessage{Role: m.Role, Content: &c})
		}
	}
	return out
}

func ptrString(s string) *string { return &s }
