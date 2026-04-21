package agent

import (
	"context"

	"moondust/src/v2/chat"
)

type Agent interface {
	LookUp(ctx context.Context) (*Status, error)

	Ask(ctx context.Context, workDir, model string, history []chat.Event, prompt string) (<-chan chat.Event, error)
}

type Status struct {
	// Constants
	DownloadURL string

	// Installation status
	Installed     bool
	BinaryPath    string
	Authenticated bool

	// Metadata
	Version string
}
