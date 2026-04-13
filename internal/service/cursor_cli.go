package service

import (
	"context"
	"moondust/internal/cursorcli"
	"moondust/internal/store"
)

// GetCursorCLIInfo runs Cursor Agent CLI detection and status probes.
func (s *Service) GetCursorCLIInfo(ctx context.Context) (*store.CursorCLIInfo, error) {
	return cursorcli.Probe(ctx)
}
