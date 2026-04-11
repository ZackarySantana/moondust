package store

import "context"

type Settings struct {
	SSHAuthSock     string `json:"ssh_auth_sock"`
	DefaultWorktree string `json:"default_worktree"` // "ask", "on", "off"; empty treated as "ask"
}

type SettingsStore interface {
	Get(ctx context.Context) (*Settings, error)
	Save(ctx context.Context, s *Settings) error
}
