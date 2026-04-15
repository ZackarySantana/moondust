package workspace_test

import (
	"os"
	"path/filepath"
	"testing"

	"moondust/internal/workspace"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestEditFileUnderRoot(t *testing.T) {
	d := t.TempDir()
	p := filepath.Join(d, "foo.go")
	require.NoError(t, os.WriteFile(p, []byte("a\nb\nc\n"), 0o644))

	out, err := workspace.EditFileUnderRootForTest(d, "foo.go", "b\n", "BB\n")
	require.NoError(t, err)
	assert.Contains(t, out, "Updated")
	assert.Contains(t, out, "foo.go")

	b, err := os.ReadFile(p)
	require.NoError(t, err)
	assert.Equal(t, "a\nBB\nc\n", string(b))
}

func TestEditFileUnderRoot_NotFound(t *testing.T) {
	d := t.TempDir()
	require.NoError(t, os.WriteFile(filepath.Join(d, "x.txt"), []byte("hello"), 0o644))
	_, err := workspace.EditFileUnderRootForTest(d, "x.txt", "nope", "z")
	require.Error(t, err)
	assert.Contains(t, err.Error(), "not found")
}

func TestEditFileUnderRoot_Ambiguous(t *testing.T) {
	d := t.TempDir()
	require.NoError(t, os.WriteFile(filepath.Join(d, "x.txt"), []byte("aa aa"), 0o644))
	_, err := workspace.EditFileUnderRootForTest(d, "x.txt", "a", "b")
	require.Error(t, err)
	assert.Contains(t, err.Error(), "exactly once")
}
