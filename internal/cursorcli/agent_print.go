package cursorcli

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"moondust/internal/store"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

const agentPrintTimeout = 30 * time.Minute

// AgentStreamUsage is token usage from a successful `result` line in stream-json output.
type AgentStreamUsage struct {
	InputTokens      int `json:"inputTokens"`
	OutputTokens     int `json:"outputTokens"`
	CacheReadTokens  int `json:"cacheReadTokens"`
	CacheWriteTokens int `json:"cacheWriteTokens"`
	// RequestID is copied from the terminal result event (not nested under usage).
	RequestID string
}

type streamJSONLine struct {
	Type        string `json:"type"`
	Subtype     string `json:"subtype"`
	RequestID   string `json:"request_id"`
	TimestampMs int64  `json:"timestamp_ms"`
	Message     *struct {
		Role    string `json:"role"`
		Content []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"content"`
	} `json:"message"`
	Result string `json:"result"`
	Usage  *struct {
		InputTokens      int `json:"inputTokens"`
		OutputTokens     int `json:"outputTokens"`
		CacheReadTokens  int `json:"cacheReadTokens"`
		CacheWriteTokens int `json:"cacheWriteTokens"`
	} `json:"usage"`
	IsError bool   `json:"is_error"`
	Error   string `json:"error"`
}

// StreamPrintHeadless runs `agent --print` with stream-json and calls onDelta for each
// partial assistant text segment (events that include timestamp_ms). Returns the final
// assistant text from the result line when successful.
// onToolRound is optional; when non-nil, receives each completed tool_call from the stream.
func StreamPrintHeadless(
	ctx context.Context,
	agentPath, workspace, model, prompt string,
	onDelta func(string) error,
	onToolRound func([]store.OpenRouterToolCallRecord) error,
) (final string, usage *AgentStreamUsage, err error) {
	prompt = strings.TrimSpace(prompt)
	if prompt == "" {
		return "", nil, fmt.Errorf("cursor agent: empty prompt")
	}
	if model == "" {
		model = "composer-2-fast"
	}

	cctx, cancel := context.WithTimeout(ctx, agentPrintTimeout)
	defer cancel()

	args := []string{
		"--print",
		"--trust",
		"--workspace", workspace,
		"--model", model,
		"--output-format", "stream-json",
		"--stream-partial-output",
	}
	cmd := exec.CommandContext(cctx, agentPath, args...)
	// Windows: default child stdin is NUL (EOF). The agent CLI treats non-TTY stdin as the
	// prompt source, so it can ignore the positional prompt and see an empty task—then it
	// answers with a generic greeting. Other platforms keep argv so we match typical CLI use.
	if runtime.GOOS == "windows" {
		cmd.Stdin = strings.NewReader(prompt)
	} else {
		cmd.Args = append(cmd.Args, prompt)
	}
	setHideConsole(cmd)
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return "", nil, err
	}
	var stderrBuf bytes.Buffer
	cmd.Stderr = &stderrBuf

	if err := cmd.Start(); err != nil {
		return "", nil, fmt.Errorf("cursor agent: %w", err)
	}

	finalText, usage, scanErr := consumeAgentStreamJSON(stdout, onDelta, onToolRound)
	waitErr := cmd.Wait()
	if waitErr != nil {
		msg := strings.TrimSpace(stderrBuf.String())
		if msg != "" {
			return "", nil, fmt.Errorf("cursor agent: %w: %s", waitErr, StripANSI(msg))
		}
		return "", nil, fmt.Errorf("cursor agent: %w", waitErr)
	}
	if scanErr != nil {
		return "", nil, scanErr
	}
	return finalText, usage, nil
}

func consumeAgentStreamJSON(
	r io.Reader,
	onDelta func(string) error,
	onToolRound func([]store.OpenRouterToolCallRecord) error,
) (string, *AgentStreamUsage, error) {
	sc := bufio.NewScanner(r)
	// Long JSON lines
	sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)

	var final string
	var usage *AgentStreamUsage

	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" {
			continue
		}
		var ev streamJSONLine
		if err := json.Unmarshal([]byte(line), &ev); err != nil {
			continue
		}
		switch ev.Type {
		case "tool_call":
			if onToolRound == nil {
				continue
			}
			var tc struct {
				Subtype  string          `json:"subtype"`
				CallID   string          `json:"call_id"`
				ToolCall json.RawMessage `json:"tool_call"`
			}
			if err := json.Unmarshal([]byte(line), &tc); err != nil {
				continue
			}
			if tc.Subtype != "completed" {
				continue
			}
			rec, ok := ParseCompletedCursorToolCall(tc.CallID, tc.ToolCall)
			if !ok {
				continue
			}
			if err := onToolRound([]store.OpenRouterToolCallRecord{rec}); err != nil {
				return "", nil, err
			}
		case "assistant":
			if ev.TimestampMs == 0 {
				continue
			}
			if ev.Message == nil {
				continue
			}
			var b strings.Builder
			for _, c := range ev.Message.Content {
				if c.Type == "text" && c.Text != "" {
					b.WriteString(c.Text)
				}
			}
			delta := b.String()
			if delta == "" {
				continue
			}
			if onDelta != nil {
				if err := onDelta(delta); err != nil {
					return "", nil, err
				}
			}
		case "result":
			if ev.Subtype == "success" && !ev.IsError {
				final = strings.TrimSpace(ev.Result)
				if ev.Usage != nil {
					usage = &AgentStreamUsage{
						InputTokens:      ev.Usage.InputTokens,
						OutputTokens:     ev.Usage.OutputTokens,
						CacheReadTokens:  ev.Usage.CacheReadTokens,
						CacheWriteTokens: ev.Usage.CacheWriteTokens,
					}
				}
				if usage != nil && strings.TrimSpace(ev.RequestID) != "" {
					usage.RequestID = strings.TrimSpace(ev.RequestID)
				}
				if usage == nil && strings.TrimSpace(ev.RequestID) != "" {
					usage = &AgentStreamUsage{RequestID: strings.TrimSpace(ev.RequestID)}
				}
			} else if ev.IsError || ev.Subtype == "error" {
				msg := strings.TrimSpace(ev.Error)
				if msg == "" {
					msg = "agent returned an error result"
				}
				return "", nil, fmt.Errorf("cursor agent: %s", msg)
			}
		}
	}
	if err := sc.Err(); err != nil {
		return "", nil, err
	}
	if strings.TrimSpace(final) == "" {
		return "", nil, fmt.Errorf("cursor agent: empty reply")
	}
	return final, usage, nil
}
