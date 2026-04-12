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
}

type SettingsStore interface {
	Get(ctx context.Context) (*Settings, error)
	Save(ctx context.Context, s *Settings) error
}
