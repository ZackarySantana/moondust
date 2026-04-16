package store

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestChatMessageMarshalUsesMetadataNotLegacyField(t *testing.T) {
	c := 0.05
	m := ChatMessage{
		ID:           "x",
		ThreadID:     "t",
		Role:         "assistant",
		Content:      "hi",
		CreatedAt:    time.Unix(0, 0).UTC(),
		ChatProvider: "openrouter",
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

func TestChatMessageMarshalRoundTripOpenRouterSegments(t *testing.T) {
	tool := OpenRouterToolCallRecord{
		ID: "call_1", Name: "read_file", Arguments: `{"path":"a.go"}`, Output: "package main\n",
	}
	m := ChatMessage{
		ID:           "x",
		ThreadID:     "t",
		Role:         "assistant",
		Content:      "Done.",
		CreatedAt:    time.Unix(0, 0).UTC(),
		ChatProvider: "openrouter",
		Metadata: &ChatMessageMetadata{
			OpenRouter: &OpenRouterChatMessageMetadata{
				Segments: []AssistantTurnSegment{
					{Tool: &tool},
				},
			},
		},
	}
	b, err := json.Marshal(m)
	require.NoError(t, err)
	var out ChatMessage
	require.NoError(t, json.Unmarshal(b, &out))
	require.Len(t, out.Metadata.OpenRouter.Segments, 1)
	require.NotNil(t, out.Metadata.OpenRouter.Segments[0].Tool)
	assert.Equal(t, "call_1", out.Metadata.OpenRouter.Segments[0].Tool.ID)
	assert.Equal(t, "read_file", out.Metadata.OpenRouter.Segments[0].Tool.Name)
	assert.Contains(t, out.Metadata.OpenRouter.Segments[0].Tool.Arguments, "a.go")
	assert.Contains(t, out.Metadata.OpenRouter.Segments[0].Tool.Output, "package main")
}
