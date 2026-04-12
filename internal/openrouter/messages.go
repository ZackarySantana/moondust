package openrouter

import "encoding/json"

// APIMessage is one message in an OpenAI-compatible chat request.
type APIMessage struct {
	Role    string  `json:"role"`
	Content *string `json:"content,omitempty"`

	ToolCalls []APIToolCall `json:"tool_calls,omitempty"`

	ToolCallID string `json:"tool_call_id,omitempty"`
	Name       string `json:"name,omitempty"`
}

// APIToolCall is an assistant tool invocation in the chat API.
type APIToolCall struct {
	ID       string `json:"id"`
	Type     string `json:"type"`
	Function struct {
		Name      string `json:"name"`
		Arguments string `json:"arguments"`
	} `json:"function"`
}

// ChatTool is a tool definition for the completions request.
type ChatTool struct {
	Type     string           `json:"type"`
	Function ChatToolFunction `json:"function"`
}

// ChatToolFunction is the function part of a tool definition.
type ChatToolFunction struct {
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Parameters  json.RawMessage `json:"parameters"`
}

type chatCompletionRequest struct {
	Model    string       `json:"model"`
	Messages []APIMessage `json:"messages"`
	Stream   bool         `json:"stream"`
	Tools    []ChatTool   `json:"tools,omitempty"`
}
