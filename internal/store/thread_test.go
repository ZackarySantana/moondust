package store

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestChatMessageUnmarshalLegacyOpenRouterCost(t *testing.T) {
	raw := `{"id":"m1","thread_id":"t1","role":"assistant","content":"hi","created_at":"2025-01-01T00:00:00Z","openrouter_cost_usd":0.00123}`
	var m ChatMessage
	require.NoError(t, json.Unmarshal([]byte(raw), &m))
	require.NotNil(t, m.Metadata)
	require.NotNil(t, m.Metadata.OpenRouter)
	require.NotNil(t, m.Metadata.OpenRouter.CostUSD)
	assert.InDelta(t, 0.00123, *m.Metadata.OpenRouter.CostUSD, 1e-9)
	assert.Nil(t, m.Metadata.OpenRouter.PromptTokens)
}

func TestChatMessageMarshalUsesMetadataNotLegacyField(t *testing.T) {
	c := 0.05
	m := ChatMessage{
		ID:        "x",
		ThreadID:  "t",
		Role:      "assistant",
		Content:   "hi",
		CreatedAt: time.Unix(0, 0).UTC(),
		Metadata: &ChatMessageMetadata{
			OpenRouter: &OpenRouterChatMessageMetadata{CostUSD: &c},
		},
	}
	b, err := json.Marshal(m)
	require.NoError(t, err)
	s := string(b)
	assert.Contains(t, s, `"metadata"`)
	assert.NotContains(t, s, `"openrouter_cost_usd"`)
}
