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
		bucketStore: newBucketStore[store.Settings](db, []byte("settings")),
	}
}

type OpenRouterSettingsStore struct {
	*bucketStore[store.OpenRouterSettings]
}

func newOpenRouterSettings(db *bbolt.DB) *OpenRouterSettingsStore {
	return &OpenRouterSettingsStore{
		bucketStore: newBucketStore[store.OpenRouterSettings](db, []byte("openrouter_settings")),
	}
}

type CursorSettingsStore struct {
	*bucketStore[store.CursorSettings]
}

func newCursorSettings(db *bbolt.DB) *CursorSettingsStore {
	return &CursorSettingsStore{
		bucketStore: newBucketStore[store.CursorSettings](db, []byte("cursor_settings")),
	}
}

type ClaudeSettingsStore struct {
	*bucketStore[store.ClaudeSettings]
}

func newClaudeSettings(db *bbolt.DB) *ClaudeSettingsStore {
	return &ClaudeSettingsStore{
		bucketStore: newBucketStore[store.ClaudeSettings](db, []byte("claude_settings")),
	}
}
