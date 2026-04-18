package provider

import (
	"context"
)

type Provider interface {
	LookUp(context.Context) (*Status, error)
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
