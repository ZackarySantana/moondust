package claudecli

import "moondust/internal/v1/store"

// DefaultChatModels is the selectable catalog when no dynamic list is available.
// Model ids match `claude --model` aliases (see `claude --help`).
func DefaultChatModels() []store.OpenRouterChatModel {
	return []store.OpenRouterChatModel{
		{ID: "sonnet", Name: "Claude Sonnet (latest)", Provider: "anthropic", Description: "Default balanced model"},
		{ID: "opus", Name: "Claude Opus (latest)", Provider: "anthropic", Description: "Most capable"},
		{ID: "haiku", Name: "Claude Haiku (latest)", Provider: "anthropic", Description: "Fast and economical"},
	}
}
