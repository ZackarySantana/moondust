package agent

import (
	"context"

	"moondust/src/v2/chat"
)

type AskOptions struct {
	// WorkDir is the working directory for the session.
	WorkDir string
	// Model is the model to use for the session.
	Model string
	// History is the history of the session.
	History []chat.Event
	// Prompt is the prompt for the session.
	Prompt string

	// SessionID is an optional ID for the session.
	SessionID string
}

type Agent interface {
	LookUp(ctx context.Context) (*Status, error)

	Ask(ctx context.Context, opts *AskOptions) (<-chan chat.Event, error)
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
