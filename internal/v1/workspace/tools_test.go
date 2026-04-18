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

	t.Run("web_search rejects empty query", func(t *testing.T) {
		_, err := RunTool(t.TempDir(), "web_search", `{"query":""}`)
		require.Error(t, err)
	})

	t.Run("edit_workspace_file", func(t *testing.T) {
		d := t.TempDir()
		require.NoError(t, os.WriteFile(filepath.Join(d, "m.go"), []byte("x := 1\n"), 0o644))
		out, err := RunTool(d, "edit_workspace_file", `{"path":"m.go","old_string":"x := 1","new_string":"x := 2"}`)
		require.NoError(t, err)
		assert.Contains(t, out, "Updated")
		b, _ := os.ReadFile(filepath.Join(d, "m.go"))
		assert.Contains(t, string(b), "x := 2")
	})

	t.Run("grep_workspace", func(t *testing.T) {
		d := t.TempDir()
		require.NoError(t, os.WriteFile(filepath.Join(d, "a.txt"), []byte("alpha\nbeta\n"), 0o644))
		out, err := RunTool(d, "grep_workspace", `{"pattern":"beta","path":".","max_results":10}`)
		require.NoError(t, err)
		assert.Contains(t, out, "a.txt")
		assert.Contains(t, out, "beta")
	})

	t.Run("write_workspace_file", func(t *testing.T) {
		d := t.TempDir()
		out, err := RunTool(d, "write_workspace_file", `{"path":"sub/x.txt","content":"hello"}`)
		require.NoError(t, err)
		assert.Contains(t, out, "Wrote")
		b, err := os.ReadFile(filepath.Join(d, "sub", "x.txt"))
		require.NoError(t, err)
		assert.Equal(t, "hello", string(b))
	})

	t.Run("find_workspace_files", func(t *testing.T) {
		d := t.TempDir()
		require.NoError(t, os.WriteFile(filepath.Join(d, "main.go"), []byte("package main\n"), 0o644))
		out, err := RunTool(d, "find_workspace_files", `{"suffix":".go","recursive":false}`)
		require.NoError(t, err)
		assert.Contains(t, out, "main.go")
	})

	t.Run("find_workspace_files requires filter", func(t *testing.T) {
		_, err := RunTool(t.TempDir(), "find_workspace_files", `{}`)
		require.Error(t, err)
	})
}
