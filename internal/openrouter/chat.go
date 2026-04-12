package openrouter

import (
	"bufio"
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

// APIMessage is one message in an OpenAI-compatible chat request.
type APIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatCompletionRequest struct {
	Model    string       `json:"model"`
	Messages []APIMessage `json:"messages"`
	Stream   bool         `json:"stream"`
}

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
			return "", fmt.Errorf("openrouter: %s", env.Error.Message)
		}
		if msg != "" {
			return "", fmt.Errorf("openrouter: HTTP %s: %s", resp.Status, truncateForErr(msg, 500))
		}
		return "", fmt.Errorf("openrouter: HTTP %s", resp.Status)
	}

	var out chatCompletionResponse
	if err := json.Unmarshal(respBody, &out); err != nil {
		return "", fmt.Errorf("decode openrouter response: %w", err)
	}
	if out.Error != nil && out.Error.Message != "" {
		return "", fmt.Errorf("openrouter: %s", out.Error.Message)
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

type streamDeltaChunk struct {
	Choices []struct {
		Delta struct {
			Content string `json:"content"`
		} `json:"delta"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

// ChatCompletionStream calls POST /v1/chat/completions with stream: true and invokes onDelta for each text delta.
func ChatCompletionStream(ctx context.Context, apiKey, model string, messages []APIMessage, onDelta func(string) error) error {
	apiKey = strings.TrimSpace(apiKey)
	if apiKey == "" {
		return fmt.Errorf("missing API key")
	}
	model = strings.TrimSpace(model)
	if model == "" {
		return fmt.Errorf("missing model")
	}
	if len(messages) == 0 {
		return fmt.Errorf("no messages")
	}
	if onDelta == nil {
		return fmt.Errorf("onDelta is required")
	}

	body := chatCompletionRequest{
		Model:    model,
		Messages: messages,
		Stream:   true,
	}
	raw, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("encode request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, chatCompletionsURL, bytes.NewReader(raw))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Accept", "text/event-stream")
	req.Header.Set("X-Title", "Moondust")

	client := &http.Client{Timeout: 0}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("openrouter stream request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		var env errorEnvelope
		if json.Unmarshal(respBody, &env) == nil && env.Error.Message != "" {
			return fmt.Errorf("openrouter: %s", env.Error.Message)
		}
		msg := strings.TrimSpace(string(respBody))
		if msg != "" {
			return fmt.Errorf("openrouter: HTTP %s: %s", resp.Status, truncateForErr(msg, 500))
		}
		return fmt.Errorf("openrouter: HTTP %s", resp.Status)
	}

	sc := bufio.NewScanner(resp.Body)
	// Long SSE lines (some providers send big chunks)
	sc.Buffer(make([]byte, 64*1024), 1024*1024)

	for sc.Scan() {
		if err := ctx.Err(); err != nil {
			return err
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
			return nil
		}
		var chunk streamDeltaChunk
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			continue
		}
		if chunk.Error != nil && chunk.Error.Message != "" {
			return fmt.Errorf("openrouter: %s", chunk.Error.Message)
		}
		if len(chunk.Choices) == 0 {
			continue
		}
		delta := chunk.Choices[0].Delta.Content
		if delta == "" {
			continue
		}
		if err := onDelta(delta); err != nil {
			return err
		}
	}
	if err := sc.Err(); err != nil {
		return fmt.Errorf("read stream: %w", err)
	}
	return nil
}
