package service

import (
	"context"
	"fmt"

	"moondust/internal/store"
)

func (s *Service) resolveThreadProject(ctx context.Context, threadID string) (*store.Thread, *store.Project, error) {
	thread, err := s.threadStore.Get(ctx, threadID)
	if err != nil {
		return nil, nil, fmt.Errorf("get thread: %w", err)
	}
	if thread == nil {
		return nil, nil, fmt.Errorf("thread not found")
	}
	project, err := s.projectStore.Get(ctx, thread.ProjectID)
	if err != nil {
		return nil, nil, fmt.Errorf("get project: %w", err)
	}
	if project == nil {
		return nil, nil, fmt.Errorf("project not found")
	}
	return thread, project, nil
}
