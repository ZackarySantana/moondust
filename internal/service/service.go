package service

import "moondust/internal/store"

type Service struct {
	projectStore  store.ProjectStore
	threadStore   store.ThreadStore
	messageStore  store.MessageStore
	settingsStore store.SettingsStore
}

func New(projectStore store.ProjectStore, threadStore store.ThreadStore, messageStore store.MessageStore, settingsStore store.SettingsStore) *Service {
	return &Service{
		projectStore: &store.ValidateProjectStore{
			ProjectStore: projectStore,
		},
		threadStore: &store.TouchThreadStore{
			ThreadStore: threadStore,
		},
		messageStore:  messageStore,
		settingsStore: settingsStore,
	}
}
