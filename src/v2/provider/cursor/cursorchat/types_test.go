package cursorchat_test

import (
	"encoding/json"
	"moondust/src/v2/provider/cursor/cursorchat"
	"os"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestEventWrapper(t *testing.T) {
	t.Parallel()

	t.Run("Small", func(t *testing.T) {
		rawData, err := os.ReadFile("testdata/example.ndjson")
		require.NoError(t, err)

		events := strings.Split(string(rawData), "\n")
		require.Len(t, events, 15)

		systemEvents := 0
		userEvents := 0
		thinkingEvents := 0
		assistantEvents := 0
		toolCallEvents := 0

		for _, event := range events {
			var eventWrapper cursorchat.EventWrapper
			require.NoError(t, json.Unmarshal([]byte(event), &eventWrapper))
			switch eventWrapper.Event.(type) {
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
		rawData, err := os.ReadFile("testdata/example2.ndjson")
		require.NoError(t, err)

		events := strings.Split(string(rawData), "\n")
		require.Len(t, events, 125)

		systemEvents := 0
		userEvents := 0
		thinkingEvents := 0
		assistantEvents := 0
		toolCallEvents := 0

		for _, event := range events {
			var eventWrapper cursorchat.EventWrapper
			require.NoError(t, json.Unmarshal([]byte(event), &eventWrapper))
			switch eventWrapper.Event.(type) {
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
