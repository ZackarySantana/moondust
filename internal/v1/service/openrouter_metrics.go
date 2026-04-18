package service

import (
	"context"
	"fmt"
	"moondust/internal/v1/store"
)

// GetOpenRouterUsageMetrics aggregates assistant message usage and billed cost across all threads.
func (s *Service) GetOpenRouterUsageMetrics(ctx context.Context) (*store.OpenRouterUsageMetrics, error) {
	threads, err := s.threadStore.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("list threads: %w", err)
	}
	var all []*store.ChatMessage
	for _, t := range threads {
		msgs, err := s.messageStore.ListByThread(ctx, t.ID)
		if err != nil {
			return nil, fmt.Errorf("list messages for thread %s: %w", t.ID, err)
		}
		all = append(all, msgs...)
	}
	return store.AggregateOpenRouterUsageMetrics(all), nil
}
