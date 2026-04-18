package cursor

import (
	"fmt"
	"moondust/src/v2/provider"
	"moondust/src/v2/provider/cursor/client"
)

const (
	downloadURL = "https://cursor.com/install"
)

var _ provider.Provider = (*Provider)(nil)

type Provider struct {
	opts *Options

	c *client.Client
}

func New(opts ...Option) *Provider {
	options := defaultOptions()
	for _, opt := range opts {
		opt(options)
	}
	return &Provider{
		opts: options,
	}
}

func (p *Provider) client() (*client.Client, error) {
	if p.c != nil {
		return p.c, nil
	}
	client, err := client.NewClient()
	if err != nil {
		return nil, fmt.Errorf("creating cursor client: %w", err)
	}
	p.c = client
	return client, nil
}
