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
	// SSHAuthsocket is an optional path to the ssh-agent socket.
	SSHAuthsocket string `json:"SSHAuthsocket"`

	// DefaultWorktree is the default worktree option.
	DefaultWorktree WorktreeOptions `json:"DefaultWorktree"`

	// UtilityProvider is the provider for utility LLM calls.
	UtilityProvider Provider `json:"UtilityProvider"`

	// UpdatedAt is the last time the settings were updated.
	UpdatedAt time.Time `json:"UpdatedAt"`
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
