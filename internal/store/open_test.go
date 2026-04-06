package store

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	bolt "go.etcd.io/bbolt"
)

func TestOpen(t *testing.T) {
	t.Run("creates db file and settings and projects buckets", func(t *testing.T) {
		isolatedUserCacheDir(t)

		_, dbPath, err := DefaultPaths()
		require.NoError(t, err)

		st, err := Open()
		require.NoError(t, err)
		require.NotNil(t, st)
		defer func() { assert.NoError(t, st.Close()) }()

		_, err = os.Stat(dbPath)
		require.NoError(t, err)

		err = st.db.View(func(tx *bolt.Tx) error {
			assert.NotNil(t, tx.Bucket(bucketSettings))
			assert.NotNil(t, tx.Bucket(bucketProjects))
			return nil
		})
		require.NoError(t, err)
	})
}
