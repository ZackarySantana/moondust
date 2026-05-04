package app

import (
	"context"
	"moondust/internal/v2/service"
	"moondust/internal/v2/store"
)

// Settings exposes global app settings to the UI layer.
type Settings struct {
	global *service.GlobalSettingsService
}

func NewSettings(global *service.GlobalSettingsService) *Settings {
	return &Settings{global: global}
}

// GetGlobal returns app-wide settings (defaults when unset).
func (a *Settings) GetGlobal(ctx context.Context) (*store.GlobalSettings, error) {
	return a.global.Get(ctx)
}

// SaveGlobal persists app-wide settings.
func (a *Settings) SaveGlobal(ctx context.Context, in *store.GlobalSettings) error {
	return a.global.Save(ctx, in)
}
