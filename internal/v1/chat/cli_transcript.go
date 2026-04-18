package chat

import (
	"moondust/internal/v1/store"
	"strings"
)

const maxCLITranscriptRunes = 200_000

// BuildCLIStylePrompt builds a single system + User/Assistant transcript for external
// CLI agents (Cursor `agent`, Claude Code `claude`, etc.).
func BuildCLIStylePrompt(system string, history []*store.ChatMessage) string {
	var b strings.Builder
	b.WriteString(system)
	b.WriteString("\n\n")
	for _, m := range history {
		switch m.Role {
		case "user":
			b.WriteString("User: ")
			b.WriteString(m.Content)
			b.WriteString("\n\n")
		case "assistant":
			b.WriteString("Assistant: ")
			b.WriteString(m.Content)
			b.WriteString("\n\n")
		}
	}
	out := strings.TrimSpace(b.String())
	if len([]rune(out)) > maxCLITranscriptRunes {
		r := []rune(out)
		out = string(r[len(r)-maxCLITranscriptRunes:])
	}
	return out
}
