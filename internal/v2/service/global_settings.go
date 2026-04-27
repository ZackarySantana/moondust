package service

import (
	"context"
	"fmt"
	"time"

	"moondust/internal/v2/store"
)

const globalSettingsID = "global"

// GlobalSettingsService loads and persists the single app-wide settings row.
type GlobalSettingsService struct {
	stores *store.Stores
}

func NewGlobalSettingsService(stores *store.Stores) *GlobalSettingsService {
	return &GlobalSettingsService{stores: stores}
}

// Get returns persisted global settings, or defaults when none exist yet.
func (s *GlobalSettingsService) Get(ctx context.Context) (*store.GlobalSettings, error) {
	gs, err := s.stores.Settings.Global.Get(ctx, []byte(globalSettingsID))
	if err != nil {
		return &store.GlobalSettings{
			DefaultWorktree: store.WorktreeOptionsOn,
			UtilityProvider: store.ProviderOpenRouter,
		}, nil
	}
	if gs.DefaultWorktree == "" {
		gs.DefaultWorktree = store.WorktreeOptionsOn
	}
	if gs.UtilityProvider == "" {
		gs.UtilityProvider = store.ProviderOpenRouter
	}
	return gs, nil
}

// Save writes global settings, creating the row on first save.
func (s *GlobalSettingsService) Save(ctx context.Context, in *store.GlobalSettings) error {
	if in == nil {
		return fmt.Errorf("settings required")
	}
	id := []byte(globalSettingsID)
	in.UpdatedAt = time.Now().UTC()
	_, err := s.stores.Settings.Global.Get(ctx, id)
	if err != nil {
		return s.stores.Settings.Global.Put(ctx, id, in)
	}
	return s.stores.Settings.Global.Update(ctx, id, in)
}
