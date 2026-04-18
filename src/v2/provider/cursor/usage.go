package cursor

import (
	"context"
	"fmt"
	"moondust/src/v2/provider/cursor/client"
)

func (p *Provider) GetUsage(ctx context.Context) (*client.Usage, error) {
	client, err := p.client()
	if err != nil {
		return nil, fmt.Errorf("getting cursor client: %w", err)
	}
	return client.GetUsage(ctx)
}
