package bbolt

import (
	"fmt"
	"moondust/internal/v2/store"
	"os"
	"path/filepath"

	"go.etcd.io/bbolt"
	bolt "go.etcd.io/bbolt"
)

func Connect() (*bolt.DB, error) {
	cacheDir, err := os.UserCacheDir()
	if err != nil {
		return nil, fmt.Errorf("get user cache directory: %w", err)
	}

	dbPath := filepath.Join(cacheDir, "moondust", "data", "database.bolt")

	if err := os.MkdirAll(filepath.Dir(dbPath), 0o755); err != nil {
		return nil, fmt.Errorf("mkdir database directory: %w", err)
	}

	db, err := bolt.Open(dbPath, 0600, nil)
	if err != nil {
		return nil, fmt.Errorf("opening database: %w", err)
	}

	return db, nil
}

func New(db *bbolt.DB) (*store.Stores, error) {
	store := &store.Stores{
		Project:   newProject(db),
		Thread:    newThread(db),
		ChatEvent: newChatEvent(db),
		Settings: struct {
			Global     store.GlobalSettingsStore
			OpenRouter store.OpenRouterSettingsStore
			Cursor     store.CursorSettingsStore
			Claude     store.ClaudeSettingsStore
		}{
			Global:     newSettings(db),
			OpenRouter: newOpenRouterSettings(db),
			Cursor:     newCursorSettings(db),
			Claude:     newClaudeSettings(db),
		},
		Log: newLog(db),
	}

	if err := store.Validate(); err != nil {
		return nil, fmt.Errorf("validate store: %w", err)
	}

	return store, nil
}
