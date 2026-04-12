package openrouter

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strings"
)

// ToolCallFinal is a completed tool invocation after the stream ends.
type ToolCallFinal struct {
	ID        string
	Name      string
	Arguments string
}

// CompletionUsage is token usage (and optional billed cost) from streaming chunks; OpenRouter often sends it on the last SSE event.
type CompletionUsage struct {
	PromptTokens     int
	CompletionTokens int
	TotalTokens      int
	CostUSD          *float64
}

type streamSseChunk struct {
	Usage *struct {
		PromptTokens     int      `json:"prompt_tokens"`
		CompletionTokens int      `json:"completion_tokens"`
		TotalTokens      int      `json:"total_tokens"`
		Cost             *float64 `json:"cost"`
	} `json:"usage"`
	Choices []struct {
		Delta struct {
			Content   string `json:"content"`
			ToolCalls []struct {
				Index    int    `json:"index"`
				ID       string `json:"id"`
				Type     string `json:"type"`
				Function struct {
					Name      string `json:"name"`
					Arguments string `json:"arguments"`
				} `json:"function"`
			} `json:"tool_calls"`
		} `json:"delta"`
		FinishReason *string `json:"finish_reason"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

type toolCallAcc struct {
	id   string
	name string
	args strings.Builder
}

// StreamCompletionRound runs one streaming chat completion (optionally with tools).
// It returns the assistant text for this round, any completed tool calls, and usage from the stream (if reported).
// onDelta receives only streamed assistant text tokens (not tool argument fragments).
func StreamCompletionRound(
	ctx context.Context,
	apiKey, model string,
	messages []APIMessage,
	tools []ChatTool,
	onDelta func(string) error,
) (assistantText string, toolCalls []ToolCallFinal, usage *CompletionUsage, err error) {
	apiKey = strings.TrimSpace(apiKey)
	if apiKey == "" {
		return "", nil, nil, fmt.Errorf("missing API key")
	}
	model = strings.TrimSpace(model)
	if model == "" {
		return "", nil, nil, fmt.Errorf("missing model")
	}
	if len(messages) == 0 {
		return "", nil, nil, fmt.Errorf("no messages")
	}
	if onDelta == nil {
		return "", nil, nil, fmt.Errorf("onDelta is required")
	}

	body := chatCompletionRequest{
		Model:    model,
		Messages: messages,
		Stream:   true,
		Tools:    tools,
	}
	raw, err := json.Marshal(body)
	if err != nil {
		return "", nil, nil, fmt.Errorf("encode request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, chatCompletionsURL, bytes.NewReader(raw))
	if err != nil {
		return "", nil, nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Accept", "text/event-stream")
	req.Header.Set("X-Title", "Moondust")

	client := &http.Client{Timeout: 0}
	resp, err := client.Do(req)
	if err != nil {
		return "", nil, nil, fmt.Errorf("openrouter stream request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		var env errorEnvelope
		if json.Unmarshal(respBody, &env) == nil && env.Error.Message != "" {
			return "", nil, nil, APIError(env.Error.Message, resp.StatusCode)
		}
		msg := strings.TrimSpace(string(respBody))
		if msg != "" {
			return "", nil, nil, APIError(truncateForErr(msg, 500), resp.StatusCode)
		}
		return "", nil, nil, APIError("", resp.StatusCode)
	}

	var text strings.Builder
	accs := make(map[int]*toolCallAcc)
	var lastUsage *CompletionUsage

	sc := bufio.NewScanner(resp.Body)
	sc.Buffer(make([]byte, 64*1024), 1024*1024)

	for sc.Scan() {
		if err := ctx.Err(); err != nil {
			return "", nil, nil, err
		}
		line := strings.TrimSpace(sc.Text())
		if line == "" || strings.HasPrefix(line, ":") {
			continue
		}
		if !strings.HasPrefix(line, "data:") {
			continue
		}
		data := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
		if data == "[DONE]" {
			break
		}
		var chunk streamSseChunk
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			continue
		}
		if chunk.Error != nil && chunk.Error.Message != "" {
			return "", nil, nil, APIError(chunk.Error.Message, 0)
		}
		if chunk.Usage != nil {
			u := &CompletionUsage{
				PromptTokens:     chunk.Usage.PromptTokens,
				CompletionTokens: chunk.Usage.CompletionTokens,
				TotalTokens:      chunk.Usage.TotalTokens,
			}
			if chunk.Usage.Cost != nil {
				u.CostUSD = chunk.Usage.Cost
			}
			lastUsage = u
		}
		if len(chunk.Choices) == 0 {
			continue
		}
		ch := chunk.Choices[0]
		if ch.Delta.Content != "" {
			text.WriteString(ch.Delta.Content)
			if err := onDelta(ch.Delta.Content); err != nil {
				return "", nil, nil, err
			}
		}
		for _, tc := range ch.Delta.ToolCalls {
			idx := tc.Index
			a := accs[idx]
			if a == nil {
				a = &toolCallAcc{}
				accs[idx] = a
			}
			if tc.ID != "" {
				a.id = tc.ID
			}
			if tc.Function.Name != "" {
				a.name = tc.Function.Name
			}
			if tc.Function.Arguments != "" {
				a.args.WriteString(tc.Function.Arguments)
			}
		}
	}
	if err := sc.Err(); err != nil {
		return "", nil, nil, fmt.Errorf("read stream: %w", err)
	}

	if len(accs) == 0 {
		return text.String(), nil, lastUsage, nil
	}

	indices := make([]int, 0, len(accs))
	for ix := range accs {
		indices = append(indices, ix)
	}
	sort.Ints(indices)
	out := make([]ToolCallFinal, 0, len(indices))
	for _, ix := range indices {
		a := accs[ix]
		if a == nil || strings.TrimSpace(a.name) == "" {
			continue
		}
		id := a.id
		if id == "" {
			id = fmt.Sprintf("call_%d", ix)
		}
		out = append(out, ToolCallFinal{
			ID:        id,
			Name:      a.name,
			Arguments: a.args.String(),
		})
	}
	return text.String(), out, lastUsage, nil
}

// AssistantWithToolCalls builds the assistant message to send in the next API round.
func AssistantWithToolCalls(content string, calls []ToolCallFinal) APIMessage {
	var c *string
	if strings.TrimSpace(content) != "" {
		c = &content
	}
	tcs := make([]APIToolCall, len(calls))
	for i, x := range calls {
		tcs[i].ID = x.ID
		tcs[i].Type = "function"
		tcs[i].Function.Name = x.Name
		tcs[i].Function.Arguments = x.Arguments
	}
	return APIMessage{
		Role:      "assistant",
		Content:   c,
		ToolCalls: tcs,
	}
}

// ToolResultMessage is a tool output message for the chat API.
func ToolResultMessage(toolCallID, output string) APIMessage {
	c := output
	return APIMessage{
		Role:       "tool",
		ToolCallID: toolCallID,
		Content:    &c,
	}
}
