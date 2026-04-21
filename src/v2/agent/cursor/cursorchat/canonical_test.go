package cursorchat_test

import (
	"encoding/json"
	"moondust/src/v2/agent/cursor/cursorchat"
	"moondust/src/v2/chat"
	"os"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestToCanonical(t *testing.T) {
	t.Parallel()

	t.Run("Small", func(t *testing.T) {
		t.Parallel()

		rawData, err := os.ReadFile("testdata/example_small.ndjson")
		require.NoError(t, err)

		eventsData := strings.Split(string(rawData), "\n")
		require.Len(t, eventsData, 15)

		systemEvents := 0
		userEvents := 0
		thinkingEvents := 0
		assistantEvents := 0
		toolCallEvents := 0
		otherEvents := 0

		for _, eventData := range eventsData {
			var rawEvent cursorchat.RawEvent
			require.NoError(t, json.Unmarshal([]byte(eventData), &rawEvent))
			event, err := rawEvent.Get()
			require.NoError(t, err)
			if event == nil {
				continue
			}

			canonicalEvent, err := event.ToCanonical()
			require.NoError(t, err)
			switch canonicalEvent.(type) {
			case *chat.SystemEvent:
				systemEvents++
			case *chat.UserEvent:
				userEvents++
			case *chat.ThinkingEvent:
				thinkingEvents++
			case *chat.AssistantEvent:
				assistantEvents++
			case *chat.ToolCallStartEvent:
				toolCallEvents++
			case *chat.ToolCallCompletedEvent:
				toolCallEvents++
			case *chat.OtherEvent:
				otherEvents++
			}
		}

		require.Equal(t, 1, systemEvents)
		require.Equal(t, 1, userEvents)
		require.Equal(t, 11, thinkingEvents)
		require.Equal(t, 1, assistantEvents)
		require.Equal(t, 0, toolCallEvents)
		require.Equal(t, 1, otherEvents) // The result event.
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
		otherEvents := 0

		for _, eventData := range events {
			var rawEvent cursorchat.RawEvent
			require.NoError(t, json.Unmarshal([]byte(eventData), &rawEvent))
			event, err := rawEvent.Get()
			require.NoError(t, err)
			if event == nil {
				continue
			}

			canonicalEvent, err := event.ToCanonical()
			require.NoError(t, err)
			switch canonicalEvent.(type) {
			case *chat.SystemEvent:
				systemEvents++
			case *chat.UserEvent:
				userEvents++
			case *chat.ThinkingEvent:
				thinkingEvents++
			case *chat.AssistantEvent:
				assistantEvents++
			case *chat.ToolCallStartEvent:
				toolCallEvents++
			case *chat.ToolCallCompletedEvent:
				toolCallEvents++
			case *chat.OtherEvent:
				otherEvents++
			}
		}

		require.Equal(t, 1, systemEvents)
		require.Equal(t, 1, userEvents)
		require.Equal(t, 0, thinkingEvents)
		require.Equal(t, 106, assistantEvents)
		require.Equal(t, 16, toolCallEvents)
		require.Equal(t, 1, otherEvents) // The result event.
	})
}
