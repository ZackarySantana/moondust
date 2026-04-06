package store

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	bolt "go.etcd.io/bbolt"
)

func TestOpenFile(t *testing.T) {
	t.Run("creates parent directories and buckets", func(t *testing.T) {
		tmp := t.TempDir()
		cacheRoot := filepath.Join(tmp, "nested", "cache")
		dbPath := filepath.Join(cacheRoot, "data.bolt")

		st, err := OpenFile(cacheRoot, dbPath)
		require.NoError(t, err)
		require.NotNil(t, st)
		defer func() { assert.NoError(t, st.Close()) }()

		_, err = os.Stat(dbPath)
		require.NoError(t, err)
		assert.Equal(t, cacheRoot, st.CacheRoot())

		err = st.db.View(func(tx *bolt.Tx) error {
			assert.NotNil(t, tx.Bucket(bucketSettings))
			assert.NotNil(t, tx.Bucket(bucketProjects))
			return nil
		})
		require.NoError(t, err)
	})

	t.Run("reopen is idempotent for buckets", func(t *testing.T) {
		tmp := t.TempDir()
		dbPath := filepath.Join(tmp, "store.bolt")

		st1, err := OpenFile(tmp, dbPath)
		require.NoError(t, err)
		require.NoError(t, st1.Close())

		st2, err := OpenFile(tmp, dbPath)
		require.NoError(t, err)
		defer func() { assert.NoError(t, st2.Close()) }()

		err = st2.db.View(func(tx *bolt.Tx) error {
			assert.NotNil(t, tx.Bucket(bucketSettings))
			assert.NotNil(t, tx.Bucket(bucketProjects))
			return nil
		})
		require.NoError(t, err)
	})
}
