package agentstream

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"moondust/internal/store"
	"strings"
)

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

// ConsumeStreamJSON parses NDJSON stream-json lines from Cursor/Claude Code CLI
// (compatible event shapes). errPrefix is used in error strings, e.g. "cursor agent" or "claude code".
func ConsumeStreamJSON(
	r io.Reader,
	onDelta func(string) error,
	onToolRound func([]store.OpenRouterToolCallRecord) error,
	errPrefix string,
) (string, *StreamUsage, error) {
	sc := bufio.NewScanner(r)
	sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)

	var final string
	var usage *StreamUsage

	// Track cumulative text emitted so far. Both Cursor (--stream-partial-output) and
	// Claude Code (--include-partial-messages) send cumulative snapshots in each
	// assistant event, not incremental deltas. We diff against the last snapshot to
	// extract the true delta for the frontend.
	var lastCumulativeText string

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
			rec, ok := ParseCompletedToolCall(tc.CallID, tc.ToolCall)
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
			snapshot := b.String()
			if snapshot == "" {
				continue
			}
			// Compute incremental delta from cumulative snapshot.
			var delta string
			if strings.HasPrefix(snapshot, lastCumulativeText) {
				delta = snapshot[len(lastCumulativeText):]
			} else {
				delta = snapshot
			}
			lastCumulativeText = snapshot
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
					usage = &StreamUsage{
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
					usage = &StreamUsage{RequestID: strings.TrimSpace(ev.RequestID)}
				}
			} else if ev.IsError || ev.Subtype == "error" {
				msg := strings.TrimSpace(ev.Error)
				if msg == "" {
					msg = "agent returned an error result"
				}
				return "", nil, fmt.Errorf("%s: %s", errPrefix, msg)
			}
		}
	}
	if err := sc.Err(); err != nil {
		return "", nil, err
	}
	if strings.TrimSpace(final) == "" {
		return "", nil, fmt.Errorf("%s: empty reply", errPrefix)
	}
	return final, usage, nil
}
