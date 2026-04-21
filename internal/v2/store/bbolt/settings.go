package bbolt

import (
	"moondust/internal/v2/store"

	"go.etcd.io/bbolt"
)

var _ store.SettingsStore = (*SettingsStore)(nil)
var _ store.OpenRouterSettingsStore = (*OpenRouterSettingsStore)(nil)
var _ store.CursorSettingsStore = (*CursorSettingsStore)(nil)
var _ store.ClaudeSettingsStore = (*ClaudeSettingsStore)(nil)

type SettingsStore struct {
	*bboltStore[store.Settings]
}

func newSettings(db *bbolt.DB) *SettingsStore {
	return &SettingsStore{
		bboltStore: new[store.Settings](db, []byte("settings")),
	}
}

type OpenRouterSettingsStore struct {
	*bboltStore[store.OpenRouterSettings]
}

func newOpenRouterSettings(db *bbolt.DB) *OpenRouterSettingsStore {
	return &OpenRouterSettingsStore{
		bboltStore: new[store.OpenRouterSettings](db, []byte("openrouter_settings")),
	}
}

type CursorSettingsStore struct {
	*bboltStore[store.CursorSettings]
}

func newCursorSettings(db *bbolt.DB) *CursorSettingsStore {
	return &CursorSettingsStore{
		bboltStore: new[store.CursorSettings](db, []byte("cursor_settings")),
	}
}

type ClaudeSettingsStore struct {
	*bboltStore[store.ClaudeSettings]
}

func newClaudeSettings(db *bbolt.DB) *ClaudeSettingsStore {
	return &ClaudeSettingsStore{
		bboltStore: new[store.ClaudeSettings](db, []byte("claude_settings")),
	}
}
