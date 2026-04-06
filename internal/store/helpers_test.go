package store

import (
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/stretchr/testify/require"
)

// isolatedUserCacheDir redirects os.UserCacheDir into t.TempDir() so Open() tests do
// not read or write the developer's real cache directory.
func isolatedUserCacheDir(t *testing.T) {
	t.Helper()
	tmp := t.TempDir()
	switch runtime.GOOS {
	case "windows":
		t.Setenv("LocalAppData", tmp)
	case "darwin":
		t.Setenv("HOME", tmp)
		require.NoError(t, os.MkdirAll(filepath.Join(tmp, "Library", "Caches"), 0o755))
	default:
		t.Setenv("XDG_CACHE_HOME", tmp)
	}
}

func openTestStore(t *testing.T) *Store {
	t.Helper()
	root := t.TempDir()
	st, err := OpenFile(root, filepath.Join(root, "store.bolt"))
	require.NoError(t, err)
	t.Cleanup(func() { _ = st.Close() })
	return st
}
