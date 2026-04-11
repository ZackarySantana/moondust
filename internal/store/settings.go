package store

import "context"

type Settings struct {
	SSHAuthSock string `json:"ssh_auth_sock"`
}

type SettingsStore interface {
	Get(ctx context.Context) (*Settings, error)
	Save(ctx context.Context, s *Settings) error
}
