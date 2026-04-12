package store

import "context"

type NotificationChannelConfig struct {
	Push            bool   `json:"push"`
	InApp           bool   `json:"in_app"`
	Slack           bool   `json:"slack"`
	Email           bool   `json:"email"`
	SlackWebhookURL string `json:"slack_webhook_url,omitempty"`
}

type Settings struct {
	SSHAuthSock       string                                `json:"ssh_auth_sock"`
	DefaultWorktree   string                                `json:"default_worktree"` // "ask", "on", "off"; empty treated as "ask"
	Notifications     map[string]*NotificationChannelConfig `json:"notifications"`
	KeyboardShortcuts map[string]string                     `json:"keyboard_shortcuts"`

	// OpenRouterAPIKey is persisted; never returned from GetSettings (see service).
	OpenRouterAPIKey string `json:"openrouter_api_key,omitempty"`
	// OpenRouterClear is write-only: when true, SaveSettings removes the stored API key.
	OpenRouterClear bool `json:"openrouter_clear,omitempty"`
	// HasOpenRouterAPIKey is read-only: true if a key is stored (secret is never sent).
	HasOpenRouterAPIKey bool `json:"has_openrouter_api_key,omitempty"`

	// AgentToolsEnabled maps tool function names to whether the chat agent may use them. nil means all enabled (see NormalizeAgentToolsEnabled).
	AgentToolsEnabled map[string]bool `json:"agent_tools_enabled,omitempty"`
}

type SettingsStore interface {
	Get(ctx context.Context) (*Settings, error)
	Save(ctx context.Context, s *Settings) error
}
