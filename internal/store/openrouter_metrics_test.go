package store_test

import (
	"testing"
	"time"

	"moondust/internal/store"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAggregateOpenRouterUsageMetrics(t *testing.T) {
	t1 := time.Date(2025, 3, 1, 12, 0, 0, 0, time.UTC)
	t2 := time.Date(2025, 3, 2, 12, 0, 0, 0, time.UTC)
	t3 := time.Date(2025, 3, 3, 12, 0, 0, 0, time.UTC)

	c1 := 0.01
	c2 := 0.02
	c3 := 0.05
	pt := 10
	ct := 20

	messages := []*store.ChatMessage{
		{Role: "user", Content: "hi", CreatedAt: t1, ChatProvider: "openrouter"},
		{
			Role: "assistant", Content: "a", CreatedAt: t1,
			ChatProvider: "openrouter", ChatModel: "openai/gpt-4o-mini",
			Metadata: &store.ChatMessageMetadata{
				OpenRouter: &store.OpenRouterChatMessageMetadata{
					CostUSD: &c1, PromptTokens: &pt, CompletionTokens: &ct,
				},
			},
		},
		{
			Role: "assistant", Content: "b", CreatedAt: t2,
			ChatProvider: "", ChatModel: "anthropic/claude-3-haiku",
			Metadata: &store.ChatMessageMetadata{OpenRouter: &store.OpenRouterChatMessageMetadata{CostUSD: &c2}},
		},
		{
			Role: "assistant", Content: "c", CreatedAt: t3,
			ChatProvider: "openrouter", ChatModel: "openai/gpt-4o-mini",
			Metadata: &store.ChatMessageMetadata{OpenRouter: &store.OpenRouterChatMessageMetadata{CostUSD: &c3}},
		},
		{Role: "assistant", Content: "other", CreatedAt: t3, ChatProvider: "other", ChatModel: "x"},
	}

	out := store.AggregateOpenRouterUsageMetrics(messages)
	require.NotNil(t, out)
	// Non-openrouter providers are excluded.
	assert.Equal(t, 2, out.TotalAssistantMessages)
	assert.Equal(t, 1, out.DistinctModels)
	assert.InDelta(t, c1+c3, out.TotalCostUSD, 1e-9)

	require.Len(t, out.RecentlyUsed, 1)
	assert.Equal(t, "openai/gpt-4o-mini", out.RecentlyUsed[0].ModelID)
	assert.Equal(t, t3, out.RecentlyUsed[0].LastUsedAt)

	require.Len(t, out.MostUsed, 1)
	assert.Equal(t, "openai/gpt-4o-mini", out.MostUsed[0].ModelID)
	assert.Equal(t, 2, out.MostUsed[0].UseCount)

	require.Len(t, out.MostExpensive, 1)
	assert.Equal(t, "openai/gpt-4o-mini", out.MostExpensive[0].ModelID)
	assert.InDelta(t, (c1+c3)/2.0, out.MostExpensive[0].AverageCostUSD, 1e-9)
	assert.InDelta(t, c1+c3, out.MostExpensive[0].TotalCostUSD, 1e-9)

	assert.InDelta(t, (c1+c3)/2.0, out.AverageCostPerAssistantTurnUSD, 1e-9)
}

func TestAggregateOpenRouterUsageMetrics_Empty(t *testing.T) {
	out := store.AggregateOpenRouterUsageMetrics(nil)
	require.NotNil(t, out)
	assert.Equal(t, 0, out.TotalAssistantMessages)
	assert.Len(t, out.RecentlyUsed, 0)
}
