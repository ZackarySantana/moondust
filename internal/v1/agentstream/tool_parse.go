package agentstream

import (
	"encoding/json"
	"moondust/internal/v1/store"
	"sort"
	"strings"
	"unicode/utf8"
)

const maxToolOutputRunes = 16000

// ParseCompletedToolCall maps a stream-json `tool_call` / `completed` payload into
// our shared OpenRouterToolCallRecord shape (best-effort; Cursor/Claude Code schemas vary).
func ParseCompletedToolCall(callID string, toolCall json.RawMessage) (store.OpenRouterToolCallRecord, bool) {
	callID = strings.TrimSpace(callID)
	if callID == "" || len(toolCall) == 0 {
		return store.OpenRouterToolCallRecord{}, false
	}

	var variants map[string]json.RawMessage
	if err := json.Unmarshal(toolCall, &variants); err != nil || len(variants) == 0 {
		return store.OpenRouterToolCallRecord{}, false
	}

	if body, ok := variants["function"]; ok {
		return parseFunctionToolCall(callID, body)
	}
	keys := make([]string, 0, len(variants))
	for k := range variants {
		if strings.TrimSpace(k) != "" {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)
	if len(keys) == 0 {
		return store.OpenRouterToolCallRecord{}, false
	}
	key := keys[0]
	return parseNamedToolVariant(callID, key, variants[key])
}

func parseFunctionToolCall(callID string, body json.RawMessage) (store.OpenRouterToolCallRecord, bool) {
	var fn struct {
		Name      string          `json:"name"`
		Arguments json.RawMessage `json:"arguments"`
		Result    json.RawMessage `json:"result"`
	}
	if err := json.Unmarshal(body, &fn); err != nil {
		return store.OpenRouterToolCallRecord{}, false
	}
	name := strings.TrimSpace(fn.Name)
	if name == "" {
		name = "function"
	}
	args := "{}"
	if len(fn.Arguments) > 0 {
		args = string(fn.Arguments)
	}
	return store.OpenRouterToolCallRecord{
		ID:        callID,
		Name:      name,
		Arguments: args,
		Output:    truncateToolOutput(string(fn.Result)),
	}, true
}

func parseNamedToolVariant(callID, variantKey string, body json.RawMessage) (store.OpenRouterToolCallRecord, bool) {
	var obj struct {
		Args   json.RawMessage `json:"args"`
		Result json.RawMessage `json:"result"`
	}
	if err := json.Unmarshal(body, &obj); err != nil {
		return store.OpenRouterToolCallRecord{}, false
	}

	name := strings.TrimSuffix(variantKey, "ToolCall")
	if name == "" {
		name = variantKey
	}

	args := "{}"
	if len(obj.Args) > 0 {
		args = string(obj.Args)
	}

	out := ""
	if len(obj.Result) > 0 {
		out = truncateToolOutput(string(obj.Result))
	}

	return store.OpenRouterToolCallRecord{
		ID:        callID,
		Name:      name,
		Arguments: args,
		Output:    out,
	}, true
}

func truncateToolOutput(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return ""
	}
	if utf8.RuneCountInString(s) <= maxToolOutputRunes {
		return s
	}
	r := []rune(s)
	if len(r) <= maxToolOutputRunes {
		return s
	}
	return string(r[:maxToolOutputRunes]) + "…"
}
