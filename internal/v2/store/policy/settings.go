package policy

import (
	"context"
	"errors"
	"moondust/internal/v2/store"
	"time"
)

var _ store.GlobalSettingsStore = (*GlobalSettingsStore)(nil)
var _ store.OpenRouterSettingsStore = (*OpenRouterSettingsStore)(nil)
var _ store.CursorSettingsStore = (*CursorSettingsStore)(nil)
var _ store.ClaudeSettingsStore = (*ClaudeSettingsStore)(nil)

type GlobalSettingsStore struct {
	store store.GlobalSettingsStore
}

func WrapGlobalSettings(store store.GlobalSettingsStore) *GlobalSettingsStore {
	return &GlobalSettingsStore{store}
}

func (t *GlobalSettingsStore) Get(ctx context.Context, id []byte) (*store.GlobalSettings, error) {
	return t.store.Get(ctx, id)
}

func (t *GlobalSettingsStore) Put(ctx context.Context, id []byte, data *store.GlobalSettings) error {
	data.UpdatedAt = time.Now()
	return t.store.Put(ctx, id, data)
}

func (t *GlobalSettingsStore) List(ctx context.Context) ([]*store.GlobalSettings, error) {
	return t.store.List(ctx)
}

func (t *GlobalSettingsStore) Update(ctx context.Context, id []byte, data *store.GlobalSettings) error {
	data.UpdatedAt = time.Now()
	return t.store.Update(ctx, id, data)
}

func (t *GlobalSettingsStore) Delete(ctx context.Context, id []byte) error {
	return errors.New("Global settings can not be deleted")
}

type OpenRouterSettingsStore struct {
	store store.OpenRouterSettingsStore
}

func WrapOpenRouterSettings(store store.OpenRouterSettingsStore) *OpenRouterSettingsStore {
	return &OpenRouterSettingsStore{store}
}

func (t *OpenRouterSettingsStore) Get(ctx context.Context, id []byte) (*store.OpenRouterSettings, error) {
	return t.store.Get(ctx, id)
}

func (t *OpenRouterSettingsStore) Put(ctx context.Context, id []byte, data *store.OpenRouterSettings) error {
	data.UpdatedAt = time.Now()
	return t.store.Put(ctx, id, data)
}

func (t *OpenRouterSettingsStore) List(ctx context.Context) ([]*store.OpenRouterSettings, error) {
	return t.store.List(ctx)
}

func (t *OpenRouterSettingsStore) Update(ctx context.Context, id []byte, data *store.OpenRouterSettings) error {
	data.UpdatedAt = time.Now()
	return t.store.Update(ctx, id, data)
}

func (t *OpenRouterSettingsStore) Delete(ctx context.Context, id []byte) error {
	return errors.New("OpenRouter settings can not be deleted")
}

type CursorSettingsStore struct {
	store store.CursorSettingsStore
}

func WrapCursorSettings(store store.CursorSettingsStore) *CursorSettingsStore {
	return &CursorSettingsStore{store}
}

func (t *CursorSettingsStore) Get(ctx context.Context, id []byte) (*store.CursorSettings, error) {
	return t.store.Get(ctx, id)
}

func (t *CursorSettingsStore) Put(ctx context.Context, id []byte, data *store.CursorSettings) error {
	data.UpdatedAt = time.Now()
	return t.store.Put(ctx, id, data)
}

func (t *CursorSettingsStore) List(ctx context.Context) ([]*store.CursorSettings, error) {
	return t.store.List(ctx)
}

func (t *CursorSettingsStore) Update(ctx context.Context, id []byte, data *store.CursorSettings) error {
	data.UpdatedAt = time.Now()
	return t.store.Update(ctx, id, data)
}

func (t *CursorSettingsStore) Delete(ctx context.Context, id []byte) error {
	return errors.New("Cursor settings can not be deleted")
}

type ClaudeSettingsStore struct {
	store store.ClaudeSettingsStore
}

func WrapClaudeSettings(store store.ClaudeSettingsStore) *ClaudeSettingsStore {
	return &ClaudeSettingsStore{store}
}

func (t *ClaudeSettingsStore) Get(ctx context.Context, id []byte) (*store.ClaudeSettings, error) {
	return t.store.Get(ctx, id)
}

func (t *ClaudeSettingsStore) Put(ctx context.Context, id []byte, data *store.ClaudeSettings) error {
	data.UpdatedAt = time.Now()
	return t.store.Put(ctx, id, data)
}

func (t *ClaudeSettingsStore) List(ctx context.Context) ([]*store.ClaudeSettings, error) {
	return t.store.List(ctx)
}

func (t *ClaudeSettingsStore) Update(ctx context.Context, id []byte, data *store.ClaudeSettings) error {
	data.UpdatedAt = time.Now()
	return t.store.Update(ctx, id, data)
}

func (t *ClaudeSettingsStore) Delete(ctx context.Context, id []byte) error {
	return errors.New("Claude settings can not be deleted")
}
