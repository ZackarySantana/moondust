package cursorchat

import (
	"encoding/json"
	"fmt"
	"moondust/src/v2/chat"
)

type EventWrapper struct {
	Event Event
}

func (e *EventWrapper) UnmarshalJSON(data []byte) error {
	var raw RawEvent
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	switch raw.Type {
	case "system":
		switch raw.SubType {
		case "init":
			var initEvent InitSystemEvent
			if err := json.Unmarshal(raw.Raw, &initEvent); err != nil {
				return err
			}
			e.Event = &initEvent
		default:
			return fmt.Errorf("unknown system event subtype '%s': %s", raw.SubType, string(raw.Raw))
		}
	case "user":
		var userEvent UserEvent
		if err := json.Unmarshal(raw.Raw, &userEvent); err != nil {
			return err
		}
		e.Event = &userEvent
	case "thinking":
		var thinkingEvent ThinkingEvent
		if err := json.Unmarshal(raw.Raw, &thinkingEvent); err != nil {
			return err
		}
		e.Event = &thinkingEvent
	case "assistant":
		var assistantEvent AssistantEvent
		if err := json.Unmarshal(raw.Raw, &assistantEvent); err != nil {
			return err
		}
		e.Event = &assistantEvent
	case "tool_call":
		var toolCallEvent ToolCallEvent
		if err := json.Unmarshal(raw.Raw, &toolCallEvent); err != nil {
			return err
		}
		e.Event = &toolCallEvent
	case "result":
		// Ignore result events.
		return nil
	default:
		return fmt.Errorf("unknown event type '%s': %s", raw.Type, string(raw.Raw))
	}

	return nil
}

type Event interface {
	ToCanonical() (chat.Event, error)

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

func (e *RawEvent) Get() (Event, error) {
	switch e.Type {
	case "system":
		switch e.SubType {
		case "init":
			var initEvent InitSystemEvent
			if err := json.Unmarshal(e.Raw, &initEvent); err != nil {
				return nil, err
			}
			return &initEvent, nil
		default:
			return nil, fmt.Errorf("unknown system event subtype '%s': %s", e.SubType, string(e.Raw))
		}
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
	case "tool_call":
		var toolCallEvent ToolCallEvent
		if err := json.Unmarshal(e.Raw, &toolCallEvent); err != nil {
			return nil, err
		}
		return &toolCallEvent, nil
	case "result":
		// Ignore result events.
		return nil, nil
	default:
		return nil, fmt.Errorf("unknown event type '%s': %s", e.Type, string(e.Raw))
	}
}

type InitSystemEvent struct {
	ApiKeySource   string `json:"apiKeySource"`
	CWD            string `json:"cwd"`
	SessionID      string `json:"session_id"`
	Model          string `json:"model"`
	PermissionMode string `json:"permissionMode"`
}

func (e *InitSystemEvent) MarshalJSON() ([]byte, error) {
	type Alias InitSystemEvent
	return json.Marshal(&struct {
		Type    string `json:"type"`
		SubType string `json:"subtype"`
		*Alias
	}{
		Type:    "system",
		SubType: "init",
		Alias:   (*Alias)(e),
	})
}

func (e *InitSystemEvent) ToCanonical() (chat.Event, error) {
	return &chat.SystemEvent{
		SubType: "init",
	}, nil
}

func (e *InitSystemEvent) systemEvent() {}
func (e *InitSystemEvent) event()       {}

type EventMessage struct {
	Role    string `json:"role"`
	Content []EventContent
}

func (e *EventMessage) UnmarshalJSON(data []byte) error {
	var raw struct {
		Role    string            `json:"role"`
		Content []RawEventContent `json:"content"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	e.Role = raw.Role
	e.Content = make([]EventContent, len(raw.Content))
	for i, content := range raw.Content {
		switch content.Type {
		case "text":
			var textEventContent EventContentText
			if err := json.Unmarshal(content.Raw, &textEventContent); err != nil {
				return err
			}
			e.Content[i] = &textEventContent
		default:
			return fmt.Errorf("unknown content type: %s", content.Type)
		}
	}
	return nil
}

type UserEvent struct {
	Message   EventMessage `json:"message"`
	SessionID string       `json:"session_id"`
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

func (e *UserEvent) ToCanonical() (chat.Event, error) {
	msgs, err := toCanonicalMessageList(e.Message.Content)
	if err != nil {
		return nil, fmt.Errorf("parsing user event content: %w", err)
	}
	return &chat.UserEvent{
		Message: msgs,
	}, nil
}

func (e *UserEvent) event() {}

type ThinkingEvent struct {
	// delta or completed
	SubType     string `json:"subtype"`
	Text        string `json:"text"`
	SessionID   string `json:"session_id"`
	TimestampMs int64  `json:"timestamp_ms"`
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

func (e *ThinkingEvent) ToCanonical() (chat.Event, error) {
	return &chat.ThinkingEvent{
		Text:     e.Text,
		Finished: e.SubType == "completed",
	}, nil
}

func (e *ThinkingEvent) event() {}

type AssistantEventUsage struct {
	InputTokens      int `json:"inputTokens"`
	OutputTokens     int `json:"outputTokens"`
	CacheReadTokens  int `json:"cacheReadTokens"`
	CacheWriteTokens int `json:"cacheWriteTokens"`
}

type AssistantEvent struct {
	Message   EventMessage        `json:"message"`
	SessionID string              `json:"session_id"`
	RequestID string              `json:"request_id"`
	Usage     AssistantEventUsage `json:"usage"`
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

func (e *AssistantEvent) ToCanonical() (chat.Event, error) {
	msgs, err := toCanonicalMessageList(e.Message.Content)
	if err != nil {
		return nil, fmt.Errorf("parsing assistant event content: %w", err)
	}
	return &chat.AssistantEvent{
		Content: msgs,
	}, nil
}

func (e *AssistantEvent) event() {}

type ToolCallEvent struct {
	// started or completed
	SubType string `json:"subtype"`
	CallID  string `json:"call_id"`
	// TODO-v2: This could be parsed, like `readToolCall` etc.
	ToolCall    json.RawMessage `json:"tool_call"`
	ModelCallID string          `json:"model_call_id"`
	SessionID   string          `json:"session_id"`
	TimestampMs int64           `json:"timestamp_ms"`

	// TODO-v2: This could be parsed, like `success` etc.
	// The success field in this has "relatedCursorRulePaths" and "relatedCursorRules" fields,
	// which would be very nice to have.
	Result json.RawMessage `json:"result"`
}

func (e *ToolCallEvent) MarshalJSON() ([]byte, error) {
	type Alias ToolCallEvent
	return json.Marshal(&struct {
		Type string `json:"type"`
		*Alias
	}{
		Type:  "tool_call",
		Alias: (*Alias)(e),
	})
}

func (e *ToolCallEvent) ToCanonical() (chat.Event, error) {
	if e.SubType == "started" {
		return &chat.ToolCallStartEvent{
			ID: e.CallID,
		}, nil
	}
	return &chat.ToolCallCompletedEvent{
		ID:     e.CallID,
		Result: e.Result,
	}, nil
}

func (e *ToolCallEvent) event() {}

type EventContent interface {
	content()
}

type RawEventContent struct {
	Type string `json:"type"`

	Raw json.RawMessage `json:"-"`
}

func (e *RawEventContent) UnmarshalJSON(data []byte) error {
	// Use an alias to avoid infinite recursion.
	type Alias RawEventContent
	if err := json.Unmarshal(data, (*Alias)(e)); err != nil {
		return err
	}
	// Copy the data to its own memory, we cannot use data directly.
	e.Raw = append(json.RawMessage(nil), data...)
	return nil
}

type EventContentText struct {
	Text string `json:"text"`
}

func (e *EventContentText) content() {}
