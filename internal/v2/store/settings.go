package store

import "time"

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

type GlobalSettings struct {
	// SSHAuthSocket is an optional path to the ssh-agent socket.
	SSHAuthsocket string

	// DefaultWorktree is the default worktree option.
	DefaultWorktree WorktreeOptions

	// UtilityProvider is the provider for utility LLM calls.
	UtilityProvider Provider

	// UpdatedAt is the last time the settings were updated.
	UpdatedAt time.Time
}

type GlobalSettingsStore interface {
	Store[GlobalSettings]
}

type OpenRouterSettings struct {
	APIKey string

	// UpdatedAt is the last time the settings were updated.
	UpdatedAt time.Time
}

type OpenRouterSettingsStore interface {
	Store[OpenRouterSettings]
}

type CursorSettings struct {
	// UpdatedAt is the last time the settings were updated.
	UpdatedAt time.Time
}

type CursorSettingsStore interface {
	Store[CursorSettings]
}

type ClaudeSettings struct {
	// UpdatedAt is the last time the settings were updated.
	UpdatedAt time.Time
}

type ClaudeSettingsStore interface {
	Store[ClaudeSettings]
}
