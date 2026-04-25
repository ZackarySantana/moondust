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
	*bucketStore[store.Settings]
}

func newSettings(db *bbolt.DB) *SettingsStore {
	return &SettingsStore{
		bucketStore: new[store.Settings](db, []byte("settings")),
	}
}

type OpenRouterSettingsStore struct {
	*bucketStore[store.OpenRouterSettings]
}

func newOpenRouterSettings(db *bbolt.DB) *OpenRouterSettingsStore {
	return &OpenRouterSettingsStore{
		bucketStore: new[store.OpenRouterSettings](db, []byte("openrouter_settings")),
	}
}

type CursorSettingsStore struct {
	*bucketStore[store.CursorSettings]
}

func newCursorSettings(db *bbolt.DB) *CursorSettingsStore {
	return &CursorSettingsStore{
		bucketStore: new[store.CursorSettings](db, []byte("cursor_settings")),
	}
}

type ClaudeSettingsStore struct {
	*bucketStore[store.ClaudeSettings]
}

func newClaudeSettings(db *bbolt.DB) *ClaudeSettingsStore {
	return &ClaudeSettingsStore{
		bucketStore: new[store.ClaudeSettings](db, []byte("claude_settings")),
	}
}
