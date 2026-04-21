package chat

import (
	"encoding/json"
	"fmt"
)

type Event interface {
	event()
}

type RawEvent struct {
	Type    string          `json:"type"`
	SubType string          `json:"subtype"`
	Raw     json.RawMessage `json:"-"`
}

func (e *RawEvent) UnmarshalJSON(data []byte) error {
	// Use an alias to avoid infinite recursion.
	type Alias RawEvent
	if err := json.Unmarshal(data, (*Alias)(e)); err != nil {
		return err
	}
	// Copy the data to its own memory, we cannot use data directly.
	e.Raw = append(json.RawMessage(nil), data...)
	return nil
}

func (e *RawEvent) MarshalJSON() ([]byte, error) {
	if len(e.Raw) > 0 {
		return e.Raw, nil
	}
	type Alias RawEvent
	return json.Marshal(&struct {
		*Alias
	}{
		Alias: (*Alias)(e),
	})
}

func (e *RawEvent) Get() (Event, error) {
	switch e.Type {
	case "system":
		var systemEvent SystemEvent
		if err := json.Unmarshal(e.Raw, &systemEvent); err != nil {
			return nil, err
		}
		return &systemEvent, nil
	case "user":
		var userEvent UserEvent
		if err := json.Unmarshal(e.Raw, &userEvent); err != nil {
			return nil, err
		}
		return &userEvent, nil
	case "thinking":
		var thinkingEvent ThinkingEvent
		if err := json.Unmarshal(e.Raw, &thinkingEvent); err != nil {
			return nil, err
		}
		return &thinkingEvent, nil
	case "assistant":
		var assistantEvent AssistantEvent
		if err := json.Unmarshal(e.Raw, &assistantEvent); err != nil {
			return nil, err
		}
		return &assistantEvent, nil
	case "tool_call_start":
		var toolCallStartEvent ToolCallStartEvent
		if err := json.Unmarshal(e.Raw, &toolCallStartEvent); err != nil {
			return nil, err
		}
		return &toolCallStartEvent, nil
	case "tool_call_completed":
		var toolCallCompletedEvent ToolCallCompletedEvent
		if err := json.Unmarshal(e.Raw, &toolCallCompletedEvent); err != nil {
			return nil, err
		}
		return &toolCallCompletedEvent, nil
	default:
		return nil, fmt.Errorf("unknown event type: %s", e.Type)
	}
}

type SystemEvent struct {
	SubType string `json:"subtype"`
}

func (e *SystemEvent) MarshalJSON() ([]byte, error) {
	type Alias SystemEvent
	return json.Marshal(&struct {
		Type string `json:"type"`
		*Alias
	}{
		Type:  "system",
		Alias: (*Alias)(e),
	})
}

func (e *SystemEvent) event() {}

type UserEvent struct {
	Message []Message `json:"message"`
}

func (e *UserEvent) UnmarshalJSON(data []byte) error {
	var raw struct {
		Message []RawMessage `json:"message"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	e.Message = make([]Message, len(raw.Message))
	for i, message := range raw.Message {
		message, err := message.Get()
		if err != nil {
			return err
		}
		e.Message[i] = message
	}
	return nil
}

func (e *UserEvent) MarshalJSON() ([]byte, error) {
	type Alias UserEvent
	return json.Marshal(&struct {
		Type string `json:"type"`
		*Alias
	}{
		Type:  "user",
		Alias: (*Alias)(e),
	})
}

func (e *UserEvent) event() {}

type ThinkingEvent struct {
	Text     string `json:"text"`
	Finished bool   `json:"finished"`
}

func (e *ThinkingEvent) MarshalJSON() ([]byte, error) {
	type Alias ThinkingEvent
	return json.Marshal(&struct {
		Type string `json:"type"`
		*Alias
	}{
		Type:  "thinking",
		Alias: (*Alias)(e),
	})
}

func (e *ThinkingEvent) event() {}

type AssistantEvent struct {
	Content []Message `json:"content"`
	// TODO-v2: Should we add metadata here?
}

func (e *AssistantEvent) UnmarshalJSON(data []byte) error {
	var raw struct {
		Content []RawMessage `json:"content"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	e.Content = make([]Message, len(raw.Content))
	for i, content := range raw.Content {
		message, err := content.Get()
		if err != nil {
			return err
		}
		e.Content[i] = message
	}
	return nil
}

func (e *AssistantEvent) MarshalJSON() ([]byte, error) {
	type Alias AssistantEvent
	return json.Marshal(&struct {
		Type string `json:"type"`
		*Alias
	}{
		Type:  "assistant",
		Alias: (*Alias)(e),
	})
}

func (e *AssistantEvent) event() {}

type ToolCallStartEvent struct {
	ID string `json:"id"`
}

func (e *ToolCallStartEvent) MarshalJSON() ([]byte, error) {
	type Alias ToolCallStartEvent
	return json.Marshal(&struct {
		Type string `json:"type"`
		*Alias
	}{
		Type:  "tool_call_start",
		Alias: (*Alias)(e),
	})
}

func (e *ToolCallStartEvent) event() {}

type ToolCallCompletedEvent struct {
	ID string `json:"id"`
	// TODO-v2: We should type this and have many tool call responses, make a uniform UI
	// for all of them.
	Result any `json:"result"`
}

func (e *ToolCallCompletedEvent) MarshalJSON() ([]byte, error) {
	type Alias ToolCallCompletedEvent
	return json.Marshal(&struct {
		Type string `json:"type"`
		*Alias
	}{
		Type:  "tool_call_completed",
		Alias: (*Alias)(e),
	})
}

func (e *ToolCallCompletedEvent) event() {}

// OtherEvent is a generic event that holds event data that might be
// specific to a provider.
type OtherEvent struct {
	Type string `json:"type"`
	Data []byte `json:"data"`
}

func (e *OtherEvent) event() {}

type Message interface {
	message()
}

type RawMessage struct {
	Type string `json:"type"`

	Raw json.RawMessage `json:"-"`
}

func (e *RawMessage) UnmarshalJSON(data []byte) error {
	// Use an alias to avoid infinite recursion.
	type Alias RawMessage
	if err := json.Unmarshal(data, (*Alias)(e)); err != nil {
		return err
	}
	// Copy the data to its own memory, we cannot use data directly.
	e.Raw = append(json.RawMessage(nil), data...)
	return nil
}

func (e *RawMessage) MarshalJSON() ([]byte, error) {
	if len(e.Raw) > 0 {
		return e.Raw, nil
	}
	type Alias RawMessage
	return json.Marshal(&struct {
		*Alias
	}{
		Alias: (*Alias)(e),
	})
}

func (e *RawMessage) Get() (Message, error) {
	switch e.Type {
	case "text":
		var textMessage TextMessage
		if err := json.Unmarshal(e.Raw, &textMessage); err != nil {
			return nil, err
		}
		return &textMessage, nil
	default:
		return nil, fmt.Errorf("unknown message type: %s", e.Type)
	}
}

type TextMessage struct {
	Text string `json:"text"`
}

func (e *TextMessage) message() {}
