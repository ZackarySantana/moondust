package openrouter

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

const chatCompletionsURL = "https://openrouter.ai/api/v1/chat/completions"

type chatCompletionResponse struct {
	Choices []struct {
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
		Code    int    `json:"code"`
	} `json:"error"`
}

type errorEnvelope struct {
	Error struct {
		Message string `json:"message"`
		Code    int    `json:"code"`
	} `json:"error"`
}

// ChatCompletion calls POST /v1/chat/completions (non-streaming). messages must include the system prompt first when used.
func ChatCompletion(ctx context.Context, apiKey, model string, messages []APIMessage) (string, error) {
	apiKey = strings.TrimSpace(apiKey)
	if apiKey == "" {
		return "", fmt.Errorf("missing API key")
	}
	model = strings.TrimSpace(model)
	if model == "" {
		return "", fmt.Errorf("missing model")
	}
	if len(messages) == 0 {
		return "", fmt.Errorf("no messages")
	}

	body := chatCompletionRequest{
		Model:    model,
		Messages: messages,
		Stream:   false,
	}
	raw, err := json.Marshal(body)
	if err != nil {
		return "", fmt.Errorf("encode request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, chatCompletionsURL, bytes.NewReader(raw))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Title", "Moondust")

	client := &http.Client{Timeout: 5 * time.Minute}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("openrouter request: %w", err)
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var env errorEnvelope
		msg := strings.TrimSpace(string(respBody))
		if json.Unmarshal(respBody, &env) == nil && env.Error.Message != "" {
			return "", APIError(env.Error.Message, resp.StatusCode)
		}
		if msg != "" {
			return "", APIError(truncateForErr(msg, 500), resp.StatusCode)
		}
		return "", APIError("", resp.StatusCode)
	}

	var out chatCompletionResponse
	if err := json.Unmarshal(respBody, &out); err != nil {
		return "", fmt.Errorf("decode openrouter response: %w", err)
	}
	if out.Error != nil && out.Error.Message != "" {
		return "", APIError(out.Error.Message, resp.StatusCode)
	}
	if len(out.Choices) == 0 || strings.TrimSpace(out.Choices[0].Message.Content) == "" {
		return "", fmt.Errorf("openrouter: empty assistant reply")
	}
	return strings.TrimSpace(out.Choices[0].Message.Content), nil
}

func truncateForErr(s string, max int) string {
	s = strings.TrimSpace(s)
	if len(s) <= max {
		return s
	}
	return s[:max] + "…"
}
