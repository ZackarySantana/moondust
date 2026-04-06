package store

import (
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestStore_Close(t *testing.T) {
	t.Run("nil receiver returns nil error", func(t *testing.T) {
		var s *Store
		assert.NoError(t, s.Close())
	})

	t.Run("closes open database", func(t *testing.T) {
		root := t.TempDir()
		st, err := OpenFile(root, filepath.Join(root, "store.bolt"))
		require.NoError(t, err)
		require.NoError(t, st.Close())
	})
}
