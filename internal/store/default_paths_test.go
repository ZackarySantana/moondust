package store

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDefaultPaths(t *testing.T) {
	t.Run("cache root is user cache joined with app dir and db path under root", func(t *testing.T) {
		isolatedUserCacheDir(t)
		cacheBase, err := os.UserCacheDir()
		require.NoError(t, err)

		root, dbPath, err := DefaultPaths()
		require.NoError(t, err)

		wantRoot := filepath.Join(cacheBase, appDirName)
		assert.Equal(t, wantRoot, root)
		assert.Equal(t, filepath.Join(wantRoot, dbFileName), dbPath)
	})
}
