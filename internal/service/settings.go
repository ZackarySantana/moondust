package service

import (
	"context"
	"fmt"
	"moondust/internal/openrouter"
	"moondust/internal/store"
	"strings"
)

func (s *Service) GetSettings(ctx context.Context) (*store.Settings, error) {
	raw, err := s.settingsStore.Get(ctx)
	if err != nil {
		return nil, err
	}
	if raw == nil {
		return &store.Settings{
			AgentToolsEnabled: store.DefaultAgentToolsEnabled(),
		}, nil
	}
	out := *raw
	out.AgentToolsEnabled = store.NormalizeAgentToolsEnabled(raw.AgentToolsEnabled)
	out.HasOpenRouterAPIKey = strings.TrimSpace(raw.OpenRouterAPIKey) != ""
	out.OpenRouterAPIKey = ""
	out.OpenRouterClear = false
	return &out, nil
}

// ListOpenRouterChatModels returns chat-capable models (text + tools) from OpenRouter, newest first.
func (s *Service) ListOpenRouterChatModels(ctx context.Context) ([]store.OpenRouterChatModel, error) {
	return openrouter.ListChatModels(ctx)
}

func (s *Service) SaveSettings(ctx context.Context, incoming *store.Settings) error {
	stored, err := s.settingsStore.Get(ctx)
	if err != nil {
		return err
	}
	if stored == nil {
		stored = &store.Settings{}
	}
	merged := mergeSettings(stored, incoming)
	return s.settingsStore.Save(ctx, merged)
}

func mergeSettings(stored, incoming *store.Settings) *store.Settings {
	out := *incoming
	if incoming.OpenRouterClear {
		out.OpenRouterAPIKey = ""
	} else if strings.TrimSpace(incoming.OpenRouterAPIKey) != "" {
		out.OpenRouterAPIKey = strings.TrimSpace(incoming.OpenRouterAPIKey)
	} else {
		out.OpenRouterAPIKey = stored.OpenRouterAPIKey
	}
	out.OpenRouterClear = false
	out.HasOpenRouterAPIKey = false
	if incoming.AgentToolsEnabled != nil && len(incoming.AgentToolsEnabled) > 0 {
		out.AgentToolsEnabled = incoming.AgentToolsEnabled
	} else {
		out.AgentToolsEnabled = stored.AgentToolsEnabled
	}
	return &out
}

// SetOpenRouterAPIKey stores an API key from OAuth or manual entry.
func (s *Service) SetOpenRouterAPIKey(ctx context.Context, key string) error {
	key = strings.TrimSpace(key)
	if key == "" {
		return fmt.Errorf("empty API key")
	}
	st, err := s.settingsStore.Get(ctx)
	if err != nil {
		return err
	}
	if st == nil {
		st = &store.Settings{}
	}
	st.OpenRouterAPIKey = key
	st.OpenRouterClear = false
	st.HasOpenRouterAPIKey = false
	return s.settingsStore.Save(ctx, st)
}

// ClearOpenRouterAPIKey removes the stored OpenRouter API key.
func (s *Service) ClearOpenRouterAPIKey(ctx context.Context) error {
	st, err := s.settingsStore.Get(ctx)
	if err != nil {
		return err
	}
	if st == nil {
		st = &store.Settings{}
	}
	st.OpenRouterAPIKey = ""
	st.OpenRouterClear = false
	st.HasOpenRouterAPIKey = false
	return s.settingsStore.Save(ctx, st)
}
