package store

import (
	"context"
	"fmt"
)

type Store[T any] interface {
	Put(ctx context.Context, id []byte, data *T) error
	Get(ctx context.Context, id []byte) (*T, error)
	List(ctx context.Context) ([]*T, error)
	Update(ctx context.Context, id []byte, data *T) error
	Delete(ctx context.Context, id []byte) error
}

type Stores struct {
	Project   ProjectStore
	Thread    ThreadStore
	ChatEvent ChatEventStore

	Settings struct {
		Global     SettingsStore
		OpenRouter OpenRouterSettingsStore
		Cursor     CursorSettingsStore
		Claude     ClaudeSettingsStore
	}

	Log LogStore
}

func (s *Stores) Validate() error {
	if s.Project == nil {
		return fmt.Errorf("project store is required")
	}
	if s.Thread == nil {
		return fmt.Errorf("thread store is required")
	}
	if s.ChatEvent == nil {
		return fmt.Errorf("chat event store is required")
	}
	if s.Settings.Global == nil {
		return fmt.Errorf("global settings store is required")
	}
	if s.Settings.OpenRouter == nil {
		return fmt.Errorf("open router settings store is required")
	}
	if s.Settings.Cursor == nil {
		return fmt.Errorf("cursor settings store is required")
	}
	if s.Settings.Claude == nil {
		return fmt.Errorf("claude settings store is required")
	}
	if s.Log == nil {
		return fmt.Errorf("log store is required")
	}
	return nil
}
