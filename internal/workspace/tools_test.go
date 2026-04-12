package workspace

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRunTool(t *testing.T) {
	t.Run("list root lists files", func(t *testing.T) {
		d := t.TempDir()
		require.NoError(t, os.WriteFile(filepath.Join(d, "hello.txt"), []byte("x"), 0o644))
		out, err := RunTool(d, "list_workspace_directory", `{}`)
		require.NoError(t, err)
		assert.Contains(t, out, "hello.txt")
	})

	t.Run("read file", func(t *testing.T) {
		d := t.TempDir()
		require.NoError(t, os.WriteFile(filepath.Join(d, "a.go"), []byte("package main\n"), 0o644))
		out, err := RunTool(d, "read_workspace_file", `{"path":"a.go"}`)
		require.NoError(t, err)
		assert.Contains(t, out, "package main")
	})

	t.Run("rejects parent escape", func(t *testing.T) {
		d := t.TempDir()
		_, err := RunTool(d, "read_workspace_file", `{"path":".."}`)
		require.Error(t, err)
	})

	t.Run("unknown tool", func(t *testing.T) {
		_, err := RunTool(t.TempDir(), "nope", `{}`)
		require.Error(t, err)
	})
}
