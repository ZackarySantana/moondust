package service

import (
	"context"
	"moondust/internal/v1/cursorcli"
	"moondust/internal/v1/store"
)

// GetCursorCLIInfo runs Cursor Agent CLI detection and status probes.
func (s *Service) GetCursorCLIInfo(ctx context.Context) (*store.CursorCLIInfo, error) {
	return cursorcli.Probe(ctx)
}
