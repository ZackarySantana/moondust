package store

import (
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestStore_CacheRoot(t *testing.T) {
	t.Run("nil store returns empty string", func(t *testing.T) {
		var s *Store
		assert.Equal(t, "", s.CacheRoot())
	})

	t.Run("returns cache root passed to OpenFile", func(t *testing.T) {
		root := t.TempDir()
		st, err := OpenFile(root, filepath.Join(root, "store.bolt"))
		require.NoError(t, err)
		defer func() { assert.NoError(t, st.Close()) }()
		assert.Equal(t, root, st.CacheRoot())
	})
}
