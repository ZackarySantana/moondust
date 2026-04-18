package provider

import (
	"context"

	"moondust/src/v2/chat"
)

type Provider interface {
	LookUp(context.Context) (*Status, error)

	Ask(context.Context, string) (<-chan chat.Event, error)
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
