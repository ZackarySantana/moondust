package chat

type Event interface {
	event()
}

type SystemEvent struct {
	SubType string
}

func (e *SystemEvent) event() {}

type UserEvent struct {
	Message []Message
}

func (e *UserEvent) event() {}

type ThinkingEvent struct {
	Text     string
	Finished bool
}

func (e *ThinkingEvent) event() {}

type AssistantEvent struct {
	Content []Message
	// TODO-v2: Should we add metadata here?
}

func (e *AssistantEvent) event() {}

type ToolCallStartEvent struct {
	ID string
}

func (e *ToolCallStartEvent) event() {}

type ToolCallCompletedEvent struct {
	ID string
	// TODO-v2: We should type this and have many tool call responses, make a uniform UI
	// for all of them.
	Reuslt any
}

func (e *ToolCallCompletedEvent) event() {}

type Message interface {
	message()
}

type TextMessage struct {
	Text string `json:"text"`
}

func (e *TextMessage) message() {}
