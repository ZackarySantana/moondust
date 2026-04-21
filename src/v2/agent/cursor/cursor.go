package cursor

import (
	"context"
	"fmt"
	agent "moondust/src/v2/agent"
	"moondust/src/v2/agent/cursor/client"
)

const (
	downloadURL = "https://cursor.com/install"
)

var _ agent.Agent = (*Agent)(nil)

type Agent struct {
	opts *Options

	c  *client.Client
	bp string
}

func New(opts ...Option) *Agent {
	options := defaultOptions()
	for _, opt := range opts {
		opt(options)
	}
	return &Agent{
		opts: options,
	}
}

func (a *Agent) client() (*client.Client, error) {
	if a.c != nil {
		return a.c, nil
	}
	client, err := client.NewClient()
	if err != nil {
		return nil, fmt.Errorf("creating cursor client: %w", err)
	}
	a.c = client
	return client, nil
}

func (a *Agent) binaryPath(ctx context.Context) (string, error) {
	if a.bp != "" {
		return a.bp, nil
	}
	binaryPath, err := a.opts.executor.LookPath(ctx)
	if err != nil {
		return "", fmt.Errorf("looking up cursor binary: %w", err)
	}
	a.bp = binaryPath
	return binaryPath, nil
}
