package store

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetSettings(t *testing.T) {
	t.Run("nil store returns zero settings", func(t *testing.T) {
		var s *Store
		got, err := s.GetSettings()
		require.NoError(t, err)
		assert.Equal(t, Settings{}, got)
	})

	t.Run("empty database returns zero settings", func(t *testing.T) {
		st := openTestStore(t)
		got, err := st.GetSettings()
		require.NoError(t, err)
		assert.Equal(t, Settings{}, got)
	})

	t.Run("returns persisted settings", func(t *testing.T) {
		st := openTestStore(t)
		want := Settings{}
		require.NoError(t, st.PutSettings(want))
		got, err := st.GetSettings()
		require.NoError(t, err)
		assert.Equal(t, want, got)
	})
}

func TestPutSettings(t *testing.T) {
	t.Run("nil store returns error", func(t *testing.T) {
		var s *Store
		err := s.PutSettings(Settings{})
		require.Error(t, err)
	})

	t.Run("roundtrip", func(t *testing.T) {
		st := openTestStore(t)
		want := Settings{}
		require.NoError(t, st.PutSettings(want))
		got, err := st.GetSettings()
		require.NoError(t, err)
		assert.Equal(t, want, got)
	})
}
