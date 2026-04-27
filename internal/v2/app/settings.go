package app

import (
	"context"
	"moondust/internal/v2/service"
	"moondust/internal/v2/store"
)

// Settings exposes global app settings to the Wails frontend.
type Settings struct {
	ctx context.Context

	global *service.GlobalSettingsService
}

func NewSettings(global *service.GlobalSettingsService) *Settings {
	return &Settings{
		ctx:    context.Background(),
		global: global,
	}
}

func (a *Settings) SetContext(ctx context.Context) {
	if ctx != nil {
		a.ctx = ctx
	}
}

// GetGlobal returns app-wide settings (defaults when unset).
func (a *Settings) GetGlobal() (*store.GlobalSettings, error) {
	return a.global.Get(a.ctx)
}

// SaveGlobal persists app-wide settings.
func (a *Settings) SaveGlobal(in *store.GlobalSettings) error {
	return a.global.Save(a.ctx, in)
}
