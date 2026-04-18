package service

import (
	"context"
	"fmt"
	"moondust/internal/v1/chat"
	"moondust/internal/v1/claudecli"
	"moondust/internal/v1/cursorcli"
	"moondust/internal/v1/openrouter"
	"moondust/internal/v1/rand"
	"moondust/internal/v1/store"
	"sort"
	"strings"
	"time"
)

const quickQuestionSystemPrompt = `You are a concise helper embedded in a developer workspace. The user is asking a quick question while their main agent is running. Answer briefly and precisely. You have read-only context from the main conversation and codebase—do not call tools or take actions.`

const quickContextMaxMessages = 30

// SendLaneMessage saves a user message into a specific lane and returns it.
func (s *Service) SendLaneMessage(ctx context.Context, threadID, laneID, content string) (*store.ChatMessage, error) {
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
	if strings.TrimSpace(laneID) == "" {
		laneID = string(store.LaneMain)
	}

	provider := strings.TrimSpace(thread.ChatProvider)
	if provider == "" {
		return nil, fmt.Errorf("thread has no chat_provider set")
	}

	msg := &store.ChatMessage{
		ID:           rand.Text(),
		ThreadID:     threadID,
		Role:         "user",
		Content:      trimmed,
		CreatedAt:    time.Now().UTC(),
		ChatProvider: provider,
		ChatModel:    strings.TrimSpace(thread.ChatModel),
		LaneID:       laneID,
	}
	if err := msg.Validate(); err != nil {
		return nil, err
	}
	if err := s.messageStore.Append(ctx, threadID, msg); err != nil {
		return nil, fmt.Errorf("append lane message: %w", err)
	}
	return msg, nil
}

// utilityGenerate creates a one-shot LLM text generation using the configured utility provider.
func (s *Service) utilityGenerate(ctx context.Context, st *store.Settings, workDir, system, user string) (string, error) {
	provider := st.UtilityProviderOrDefault()
	model := st.UtilityModelOrDefault()

	switch provider {
	case "openrouter":
		apiKey := strings.TrimSpace(st.OpenRouterAPIKey)
		if apiKey == "" {
			return "", fmt.Errorf("utility provider is OpenRouter but no API key is set (Settings → Providers)")
		}
		messages := []openrouter.APIMessage{
			{Role: "system", Content: ptrString(system)},
			{Role: "user", Content: ptrString(user)},
		}
		var buf strings.Builder
		_, _, _, err := openrouter.StreamCompletionRound(ctx, apiKey, model, messages, nil, func(delta string) error {
			buf.WriteString(delta)
			return nil
		}, nil)
		if err != nil {
			return "", err
		}
		return strings.TrimSpace(buf.String()), nil

	case "cursor":
		agentPath, err := cursorcli.LookAgent()
		if err != nil {
			return "", fmt.Errorf("utility provider is Cursor but `agent` CLI not found on PATH")
		}
		prompt := system + "\n\n" + user
		final, _, err := cursorcli.StreamPrintHeadless(ctx, agentPath, workDir, model, prompt, func(string) error { return nil }, nil)
		if err != nil {
			return "", err
		}
		return strings.TrimSpace(final), nil

	case "claude":
		claudePath, err := claudecli.LookClaude()
		if err != nil {
			return "", fmt.Errorf("utility provider is Claude but `claude` CLI not found on PATH")
		}
		prompt := system + "\n\n" + user
		final, _, err := claudecli.StreamPrintHeadless(ctx, claudePath, workDir, model, prompt, func(string) error { return nil }, nil)
		if err != nil {
			return "", err
		}
		return strings.TrimSpace(final), nil

	default:
		return "", fmt.Errorf("unsupported utility provider %q", provider)
	}
}

// utilityStream streams a utility LLM call, calling onDelta for each text chunk.
func (s *Service) utilityStream(ctx context.Context, st *store.Settings, workDir, system string, apiMessages []openrouter.APIMessage, onDelta func(string) error) (string, error) {
	provider := st.UtilityProviderOrDefault()
	model := st.UtilityModelOrDefault()

	switch provider {
	case "openrouter":
		apiKey := strings.TrimSpace(st.OpenRouterAPIKey)
		if apiKey == "" {
			return "", fmt.Errorf("utility provider is OpenRouter but no API key is set (Settings → Providers)")
		}
		var full strings.Builder
		_, _, _, err := openrouter.StreamCompletionRound(ctx, apiKey, model, apiMessages, nil, func(delta string) error {
			full.WriteString(delta)
			return onDelta(delta)
		}, nil)
		if err != nil {
			return "", err
		}
		return strings.TrimSpace(full.String()), nil

	case "cursor":
		agentPath, err := cursorcli.LookAgent()
		if err != nil {
			return "", fmt.Errorf("utility provider is Cursor but `agent` CLI not found on PATH")
		}
		var prompt strings.Builder
		for _, m := range apiMessages {
			if m.Content != nil {
				prompt.WriteString(*m.Content)
				prompt.WriteString("\n\n")
			}
		}
		final, _, err := cursorcli.StreamPrintHeadless(ctx, agentPath, workDir, model, prompt.String(), onDelta, nil)
		if err != nil {
			return "", err
		}
		return strings.TrimSpace(final), nil

	case "claude":
		claudePath, err := claudecli.LookClaude()
		if err != nil {
			return "", fmt.Errorf("utility provider is Claude but `claude` CLI not found on PATH")
		}
		var prompt strings.Builder
		for _, m := range apiMessages {
			if m.Content != nil {
				prompt.WriteString(*m.Content)
				prompt.WriteString("\n\n")
			}
		}
		final, _, err := claudecli.StreamPrintHeadless(ctx, claudePath, workDir, model, prompt.String(), onDelta, nil)
		if err != nil {
			return "", err
		}
		return strings.TrimSpace(final), nil

	default:
		return "", fmt.Errorf("unsupported utility provider %q", provider)
	}
}

// StreamQuickQuestion streams a quick-question reply using the configured utility provider.
func (s *Service) StreamQuickQuestion(ctx context.Context, threadID, laneID string, onDelta func(string) error) error {
	_, project, err := s.resolveThreadProject(ctx, threadID)
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

	provider := st.UtilityProviderOrDefault()
	model := st.UtilityModelOrDefault()

	allMessages, err := s.messageStore.ListByThread(ctx, threadID)
	if err != nil {
		return fmt.Errorf("list messages: %w", err)
	}
	sort.Slice(allMessages, func(i, j int) bool {
		return allMessages[i].CreatedAt.Before(allMessages[j].CreatedAt)
	})

	mainMessages := store.FilterMessagesByLane(allMessages, string(store.LaneMain))
	if len(mainMessages) > quickContextMaxMessages {
		mainMessages = mainMessages[len(mainMessages)-quickContextMaxMessages:]
	}

	laneMessages := store.FilterMessagesByLane(allMessages, laneID)

	var contextSummary strings.Builder
	contextSummary.WriteString("## Main conversation context (read-only)\n\n")
	for _, m := range mainMessages {
		role := "User"
		if m.Role == "assistant" {
			role = "Assistant"
		}
		text := m.Content
		if len(text) > 2000 {
			text = text[:2000] + "…"
		}
		contextSummary.WriteString(role)
		contextSummary.WriteString(": ")
		contextSummary.WriteString(text)
		contextSummary.WriteString("\n\n")
	}

	system := quickQuestionSystemPrompt + "\n\n" + contextSummary.String()

	apiMessages := make([]openrouter.APIMessage, 0, 1+len(laneMessages))
	apiMessages = append(apiMessages, openrouter.APIMessage{Role: "system", Content: ptrString(system)})
	for _, m := range laneMessages {
		c := m.Content
		apiMessages = append(apiMessages, openrouter.APIMessage{Role: m.Role, Content: &c})
	}

	workDir := project.Directory
	replyText, err := s.utilityStream(ctx, st, workDir, system, apiMessages, onDelta)
	if err != nil {
		return err
	}

	if replyText == "" {
		return fmt.Errorf("empty quick question reply")
	}

	replyMsg := &store.ChatMessage{
		ID:           rand.Text(),
		ThreadID:     threadID,
		Role:         "assistant",
		Content:      replyText,
		CreatedAt:    time.Now().UTC(),
		ChatProvider: provider,
		ChatModel:    model,
		LaneID:       laneID,
	}
	if err := replyMsg.Validate(); err != nil {
		return err
	}
	return s.messageStore.Append(ctx, threadID, replyMsg)
}

// SuggestCommitMessage generates a commit message from the staged diff.
func (s *Service) SuggestCommitMessage(ctx context.Context, threadID string) (string, error) {
	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return "", err
	}

	diff, err := chat.StagedDiff(dir)
	if err != nil {
		return "", fmt.Errorf("staged diff: %w", err)
	}
	if strings.TrimSpace(diff) == "" {
		return "", fmt.Errorf("no staged changes to describe")
	}

	st, err := s.settingsStore.Get(ctx)
	if err != nil {
		return "", fmt.Errorf("load settings: %w", err)
	}
	if st == nil {
		st = &store.Settings{}
	}

	return s.utilityGenerate(ctx, st, dir, chat.CommitMsgSystemPrompt, chat.CommitMsgUserPrompt(diff))
}

// ReviewBranchDiff generates a code review of the current branch vs the default branch.
func (s *Service) ReviewBranchDiff(ctx context.Context, threadID string) (string, error) {
	thread, project, err := s.resolveThreadProject(ctx, threadID)
	if err != nil {
		return "", err
	}

	dir := project.Directory
	if thread.WorktreeDir != "" {
		dir = thread.WorktreeDir
	}

	defaultBranch := strings.TrimSpace(project.DefaultBranch)
	if defaultBranch == "" {
		defaultBranch = "origin/main"
	}

	diff, err := chat.BranchDiff(dir, defaultBranch)
	if err != nil {
		return "", fmt.Errorf("branch diff: %w", err)
	}
	if strings.TrimSpace(diff) == "" {
		return "", fmt.Errorf("no changes to review (branch matches default)")
	}

	st, err := s.settingsStore.Get(ctx)
	if err != nil {
		return "", fmt.Errorf("load settings: %w", err)
	}
	if st == nil {
		st = &store.Settings{}
	}

	return s.utilityGenerate(ctx, st, dir, chat.ReviewSystemPrompt, chat.ReviewUserPrompt(diff))
}
