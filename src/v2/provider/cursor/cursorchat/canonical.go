package cursorchat

import (
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
		return &ToolCallEvent{
			CallID:   event.ID,
			SubType:  "completed",
			ToolCall: event.Result,
		}, nil

	default:
		return nil, fmt.Errorf("unknown event type: %T", event)
	}
}

func toCanonicalMessageList(contents []EventContent) ([]chat.Message, error) {
	msgs := make([]chat.Message, len(contents))
	for i, content := range contents {
		msg, err := toCanonicalMessage(content)
		if err != nil {
			return nil, fmt.Errorf("parsing event content %d: %w", i, err)
		}
		msgs[i] = msg
	}
	return msgs, nil
}

func toCanonicalMessage(content EventContent) (chat.Message, error) {
	switch content := content.(type) {
	case *EventContentText:
		return &chat.TextMessage{
			Text: content.Text,
		}, nil
	}
	return nil, fmt.Errorf("unknown content type: %T", content)
}

func fromCanonicalMessageList(messages []chat.Message) ([]EventContent, error) {
	contents := make([]EventContent, len(messages))
	for i, message := range messages {
		content, err := fromCanonicalMessage(message)
		if err != nil {
			return nil, fmt.Errorf("parsing event content %d: %w", i, err)
		}
		contents[i] = content
	}
	return contents, nil
}

func fromCanonicalMessage(message chat.Message) (EventContent, error) {
	switch message := message.(type) {
	case *chat.TextMessage:
		return &EventContentText{
			Text: message.Text,
		}, nil
	}
	return nil, fmt.Errorf("unknown message type: %T", message)
}
