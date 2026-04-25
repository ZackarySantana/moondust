package policy

import (
	"context"
	"errors"
	"moondust/internal/v2/store"
	"time"
)

var _ store.LogStore = (*LogStore)(nil)

type LogStore struct {
	store store.LogStore
}

func WrapLog(store store.LogStore) *LogStore {
	return &LogStore{store}
}

func (t *LogStore) Get(ctx context.Context, id []byte) (*store.Log, error) {
	return t.store.Get(ctx, id)
}

func (t *LogStore) Put(ctx context.Context, id []byte, data *store.Log) error {
	data.CreatedAt = time.Now()
	return t.store.Put(ctx, id, data)
}

func (t *LogStore) List(ctx context.Context) ([]*store.Log, error) {
	return t.store.List(ctx)
}

func (t *LogStore) Update(ctx context.Context, id []byte, data *store.Log) error {
	return errors.New("Logs are immutable")
}

func (t *LogStore) Delete(ctx context.Context, id []byte) error {
	return errors.New("Logs are immutable")
}
