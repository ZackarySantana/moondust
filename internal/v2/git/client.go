package git

import "context"

type AuthConfig struct {
	SSHAuthSocketOverride string
}

type CloneOptions struct {
	URL       string
	TargetDir string
	Auth      AuthConfig
}

type Client interface {
	Clone(ctx context.Context, opts CloneOptions) error
	DefaultBranch(ctx context.Context, repoDir string) string
}

func NewClient() Client {
	return &execClient{}
}
