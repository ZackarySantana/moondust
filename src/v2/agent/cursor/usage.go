package cursor

import (
	"context"
	"fmt"
)

type Usage struct {
	AutoPercentUsed  float64 `json:"autoPercentUsed"`
	APIPercentUsed   float64 `json:"apiPercentUsed"`
	TotalPercentUsed float64 `json:"totalPercentUsed"`
}

func (a *Agent) GetUsage(ctx context.Context) (*Usage, error) {
	client, err := a.client()
	if err != nil {
		return nil, fmt.Errorf("getting cursor client: %w", err)
	}
	usage, err := client.GetUsage(ctx)
	if err != nil {
		return nil, fmt.Errorf("calling cursor client: %w", err)
	}
	return &Usage{
		AutoPercentUsed:  valueOf(usage.PlanUsage.AutoPercentUsed),
		APIPercentUsed:   valueOf(usage.PlanUsage.APIPercentUsed),
		TotalPercentUsed: valueOf(usage.PlanUsage.TotalPercentUsed),
	}, nil
}

func valueOf[T any](v *T) T {
	if v == nil {
		return *new(T)
	}
	return *v
}
