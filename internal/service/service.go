package service

import (
	"sync"
	"time"

	"moondust/internal/store"
)

type Service struct {
	projectStore  store.ProjectStore
	threadStore   store.ThreadStore
	messageStore  store.MessageStore
	settingsStore store.SettingsStore

	lastFetchMu    sync.Mutex
	lastFetchByDir map[string]time.Time
}

func New(projectStore store.ProjectStore, threadStore store.ThreadStore, messageStore store.MessageStore, settingsStore store.SettingsStore) *Service {
	return &Service{
		projectStore: &store.ValidateProjectStore{
			ProjectStore: projectStore,
		},
		threadStore: &store.TouchThreadStore{
			ThreadStore: threadStore,
		},
		messageStore:   messageStore,
		settingsStore:  settingsStore,
		lastFetchByDir: make(map[string]time.Time),
	}
}
