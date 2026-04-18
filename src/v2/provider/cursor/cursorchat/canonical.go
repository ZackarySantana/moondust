package cursorchat

import (
	"encoding/json"
	"fmt"
	"moondust/src/v2/chat"
)

func FromCanonical(event chat.Event) (Event, error) {
	switch event := event.(type) {
	case *chat.SystemEvent:
		if event.SubType == "init" {
			return &InitSystemEvent{}, nil
		}
		return nil, fmt.Errorf("unknown system event subtype: %s", event.SubType)

	case *chat.UserEvent:
		contents, err := fromCanonicalMessageList(event.Message)
		if err != nil {
			return nil, fmt.Errorf("converting user event to canonical: %w", err)
		}
		return &UserEvent{
			Message: EventMessage{
				Role:    "user",
				Content: contents,
			},
		}, nil

	case *chat.ThinkingEvent:
		if event.Finished {
			return &ThinkingEvent{
				SubType: "completed",
				Text:    event.Text,
			}, nil
		}
		return &ThinkingEvent{
			SubType: "delta",
			Text:    event.Text,
		}, nil

	case *chat.AssistantEvent:
		contents, err := fromCanonicalMessageList(event.Content)
		if err != nil {
			return nil, fmt.Errorf("converting assistant event to canonical: %w", err)
		}
		return &AssistantEvent{
			Message: EventMessage{
				Role:    "assistant",
				Content: contents,
			},
		}, nil

	case *chat.ToolCallStartEvent:
		return &ToolCallEvent{
			CallID:  event.ID,
			SubType: "started",
		}, nil

	case *chat.ToolCallCompletedEvent:
		result, err := json.Marshal(event.Result)
		if err != nil {
			return nil, fmt.Errorf("marshalling tool call result: %w", err)
		}
		return &ToolCallEvent{
			CallID:  event.ID,
			SubType: "completed",
			Result:  result,
		}, nil

	default:
		return nil, fmt.Errorf("unknown event type: %T", event)
	}
}
