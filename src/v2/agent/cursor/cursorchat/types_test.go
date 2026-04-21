package cursorchat_test

import (
	"encoding/json"
	"moondust/src/v2/agent/cursor/cursorchat"
	"os"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestEvent(t *testing.T) {
	t.Parallel()

	t.Run("Small", func(t *testing.T) {
		t.Parallel()

		rawData, err := os.ReadFile("testdata/example_small.ndjson")
		require.NoError(t, err)

		events := strings.Split(string(rawData), "\n")
		require.Len(t, events, 15)

		systemEvents := 0
		userEvents := 0
		thinkingEvents := 0
		assistantEvents := 0
		toolCallEvents := 0

		for _, eventData := range events {
			var rawEvent cursorchat.RawEvent
			require.NoError(t, json.Unmarshal([]byte(eventData), &rawEvent))
			event, err := rawEvent.Get()
			require.NoError(t, err)
			switch event.(type) {
			case *cursorchat.InitSystemEvent:
				systemEvents++
			case *cursorchat.UserEvent:
				userEvents++
			case *cursorchat.ThinkingEvent:
				thinkingEvents++
			case *cursorchat.AssistantEvent:
				assistantEvents++
			case *cursorchat.ToolCallEvent:
				toolCallEvents++
			}
		}

		require.Equal(t, 1, systemEvents)
		require.Equal(t, 1, userEvents)
		require.Equal(t, 11, thinkingEvents)
		require.Equal(t, 1, assistantEvents)
		require.Equal(t, 0, toolCallEvents)
	})

	t.Run("Large", func(t *testing.T) {
		t.Parallel()

		rawData, err := os.ReadFile("testdata/example_large.ndjson")
		require.NoError(t, err)

		events := strings.Split(string(rawData), "\n")
		require.Len(t, events, 125)

		systemEvents := 0
		userEvents := 0
		thinkingEvents := 0
		assistantEvents := 0
		toolCallEvents := 0

		for _, eventData := range events {
			var rawEvent cursorchat.RawEvent
			require.NoError(t, json.Unmarshal([]byte(eventData), &rawEvent))
			event, err := rawEvent.Get()
			require.NoError(t, err)
			switch event.(type) {
			case *cursorchat.InitSystemEvent:
				systemEvents++
			case *cursorchat.UserEvent:
				userEvents++
			case *cursorchat.ThinkingEvent:
				thinkingEvents++
			case *cursorchat.AssistantEvent:
				assistantEvents++
			case *cursorchat.ToolCallEvent:
				toolCallEvents++
			}
		}

		require.Equal(t, 1, systemEvents)
		require.Equal(t, 1, userEvents)
		require.Equal(t, 0, thinkingEvents)
		require.Equal(t, 106, assistantEvents)
		require.Equal(t, 16, toolCallEvents)
	})
}
