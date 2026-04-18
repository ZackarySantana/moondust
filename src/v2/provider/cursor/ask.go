package cursor

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"moondust/src/v2/chat"
	"strings"
)

func (p *Provider) Ask(ctx context.Context, workDir, model string, history []chat.Event, prompt string) (<-chan chat.Event, error) {
	bp, err := p.binaryPath(ctx)
	if err != nil {
		return nil, fmt.Errorf("getting cursor binary path: %w", err)
	}

	events := make(chan chat.Event)

	// Compile history.
	message := []string{
		"history here",
		prompt,
	}

	stdout, _, err := p.opts.executor.Run(
		ctx,
		bp,
		"--print",
		"--output-format", "stream-json",
		"--stream-partial-output",
		"--trust", "--force",
		"--workspace", workDir,
		"--model", model,
		strings.Join(message, "\n"),
	)

	sc := bufio.NewScanner(stdout)
	sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)

	go func() {
		defer close(events)

		for sc.Scan() {
			line := strings.TrimSpace(sc.Text())
			if line == "" {
				continue
			}
			event, err := p.parseLineToEvent(line)
			if err != nil {
				// TODO-v2: log error? New event type?
				return
			}
			select {
			case <-ctx.Done():
				return
			case events <- event:
			}
		}
	}()

	return events, nil
}

type RawEvent struct {
	Type    string          `json:"type"`
	SubType string          `json:"subtype"`
	Raw     json.RawMessage `json:"-"`
}

type InitSystemEvent struct {
	ApiKeySource   string `json:"apiKeySource"`
	CWD            string `json:"cwd"`
	SessionID      string `json:"session_id"`
	Model          string `json:"model"`
	PermissionMode string `json:"permissionMode"`
}

type EventContent struct {
	Type string          `json:"type"`
	Raw  json.RawMessage `json:"-"`
}

type EventContentText struct {
	Text string `json:"text"`
}

type EventMessage struct {
	Role    string         `json:"role"`
	Content []EventContent `json:"content"`
}

type UserEvent struct {
	Message   EventMessage `json:"message"`
	SessionID string       `json:"session_id"`
}

type ThinkingEvent struct {
	// delta or completed
	SubType     string `json:"subtype"`
	Text        string `json:"text"`
	SessionID   string `json:"session_id"`
	TimestampMs int64  `json:"timestamp_ms"`
}

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

func (p *Provider) parseLineToEvent(line string) (chat.Event, error) {
	var event RawEvent
	if err := json.Unmarshal([]byte(line), &event); err != nil {
		return nil, fmt.Errorf("unmarshalling event: %w", err)
	}

	switch event.Type {
	case "system":
		switch event.SubType {
		case "init":
			var initEvent InitSystemEvent
			if err := json.Unmarshal(event.Raw, &initEvent); err != nil {
				return nil, fmt.Errorf("unmarshalling init event: %w", err)
			}
			// TODO-v2: Should we log this?
		}
		return &chat.SystemEvent{
			SubType: event.SubType,
		}, nil

	case "user":
		var userEvent UserEvent
		if err := json.Unmarshal(event.Raw, &userEvent); err != nil {
			return nil, fmt.Errorf("unmarshalling user event: %w", err)
		}
		msgs := make([]chat.Message, len(userEvent.Message.Content))
		for i, content := range userEvent.Message.Content {
			msg, err := p.parseUserEventContent(content)
			if err != nil {
				return nil, fmt.Errorf("parsing user event content: %w", err)
			}
			msgs[i] = msg
		}
		return &chat.UserEvent{
			Message: msgs,
		}, nil

	case "thinking":
		var thinkingEvent ThinkingEvent
		if err := json.Unmarshal(event.Raw, &thinkingEvent); err != nil {
			return nil, fmt.Errorf("unmarshalling thinking event: %w", err)
		}
		return &chat.ThinkingEvent{
			Text:     thinkingEvent.Text,
			Finished: thinkingEvent.SubType == "completed",
		}, nil

	case "assistant":
		var assistantEvent AssistantEvent
		if err := json.Unmarshal(event.Raw, &assistantEvent); err != nil {
			return nil, fmt.Errorf("unmarshalling assistant event: %w", err)
		}
		msgs := make([]chat.Message, len(assistantEvent.Message.Content))
		for i, content := range assistantEvent.Message.Content {
			msg, err := p.parseUserEventContent(content)
			if err != nil {
				return nil, fmt.Errorf("parsing user event content: %w", err)
			}
			msgs[i] = msg
		}
		return &chat.AssistantEvent{
			Content: msgs,
		}, nil

	case "tool_call":
		var toolCallEvent ToolCallEvent
		if err := json.Unmarshal(event.Raw, &toolCallEvent); err != nil {
			return nil, fmt.Errorf("unmarshalling tool call event: %w", err)
		}
		if toolCallEvent.SubType == "started" {
			return &chat.ToolCallStartEvent{
				ID: toolCallEvent.CallID,
			}, nil
		}
		var result any
		if err := json.Unmarshal(toolCallEvent.Result, &result); err != nil {
			return nil, fmt.Errorf("unmarshalling tool call result: %w", err)
		}
		return &chat.ToolCallCompletedEvent{
			ID:     toolCallEvent.CallID,
			Reuslt: result,
		}, nil
	}

	return nil, fmt.Errorf("unknown event type: %s", event.Type)
}

func (p *Provider) parseUserEventContent(content EventContent) (chat.Message, error) {
	switch content.Type {
	case "text":
		var textContent EventContentText
		if err := json.Unmarshal(content.Raw, &textContent); err != nil {
			return nil, fmt.Errorf("unmarshalling text content: %w", err)
		}
		return &chat.TextMessage{
			Text: textContent.Text,
		}, nil
	}

	return nil, fmt.Errorf("unknown content type: %s", content.Type)
}
