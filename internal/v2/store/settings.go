package store

type WorktreeOptions string

const (
	WorktreeOptionsAsk WorktreeOptions = "ask"
	WorktreeOptionsOn  WorktreeOptions = "on"
	WorktreeOptionsOff WorktreeOptions = "off"
)

type Provider string

const (
	ProviderOpenRouter Provider = "openrouter"
	ProviderCursor     Provider = "cursor"
	ProviderClaude     Provider = "claude"
)

type Settings struct {
	// SSHAuthSocket is an optional path to the ssh-agent socket.
	SSHAuthsocket string

	// DefaultWorktree is the default worktree option.
	DefaultWorktree WorktreeOptions

	// UtilityProvider is the provider for utility LLM calls.
	UtilityProvider Provider
}

type SettingsStore interface {
	Store[Settings]
}

type OpenRouterSettings struct {
	APIKey string
}

type OpenRouterSettingsStore interface {
	Store[OpenRouterSettings]
}

type CursorSettings struct{}

type CursorSettingsStore interface {
	Store[CursorSettings]
}

type ClaudeSettings struct{}

type ClaudeSettingsStore interface {
	Store[ClaudeSettings]
}
