package store

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestStore_CreateProject(t *testing.T) {
	t.Run("nil store returns error", func(t *testing.T) {
		var s *Store
		p, err := s.CreateProject(CreateProjectParams{Name: "x", RemoteURL: "https://example.com/r.git"})
		require.Error(t, err)
		assert.Nil(t, p)
	})

	t.Run("empty name returns ErrInvalidName", func(t *testing.T) {
		st := openTestStore(t)
		p, err := st.CreateProject(CreateProjectParams{Name: "  ", RemoteURL: "https://example.com/r.git"})
		require.ErrorIs(t, err, ErrInvalidName)
		assert.Nil(t, p)
	})

	t.Run("remote URL creates directory under cache and stores project", func(t *testing.T) {
		st := openTestStore(t)
		p, err := st.CreateProject(CreateProjectParams{
			Name:      "My App",
			RemoteURL: "git@github.com:org/repo.git",
		})
		require.NoError(t, err)
		require.NotNil(t, p)
		assert.Equal(t, "My App", p.Name)
		assert.Equal(t, "git@github.com:org/repo.git", p.RemoteURL)
		wantDir := filepath.Join(st.CacheRoot(), projectsSubdir, "My-App")
		assert.Equal(t, wantDir, p.Directory)
		_, err = os.Stat(p.Directory)
		require.NoError(t, err)
	})

	t.Run("local directory uses existing path", func(t *testing.T) {
		st := openTestStore(t)
		dir := t.TempDir()
		p, err := st.CreateProject(CreateProjectParams{
			Name:      "local",
			Directory: dir,
		})
		require.NoError(t, err)
		require.NotNil(t, p)
		assert.Equal(t, dir, p.Directory)
		assert.Empty(t, p.RemoteURL)
	})

	t.Run("local directory rejects file path", func(t *testing.T) {
		st := openTestStore(t)
		f := filepath.Join(t.TempDir(), "file")
		require.NoError(t, os.WriteFile(f, []byte("x"), 0o644))
		p, err := st.CreateProject(CreateProjectParams{Name: "x", Directory: f})
		require.Error(t, err)
		assert.Nil(t, p)
	})

	t.Run("remote and local together returns ErrInvalidParams", func(t *testing.T) {
		st := openTestStore(t)
		p, err := st.CreateProject(CreateProjectParams{
			Name:      "x",
			RemoteURL: "https://a.git",
			Directory: t.TempDir(),
		})
		require.ErrorIs(t, err, ErrInvalidParams)
		assert.Nil(t, p)
	})

	t.Run("neither remote nor local returns ErrInvalidParams", func(t *testing.T) {
		st := openTestStore(t)
		p, err := st.CreateProject(CreateProjectParams{Name: "only-name"})
		require.ErrorIs(t, err, ErrInvalidParams)
		assert.Nil(t, p)
	})

	t.Run("duplicate name returns ErrProjectExists", func(t *testing.T) {
		st := openTestStore(t)
		params := CreateProjectParams{Name: "dup", RemoteURL: "https://example.com/a.git"}
		_, err := st.CreateProject(params)
		require.NoError(t, err)
		p2, err := st.CreateProject(params)
		require.ErrorIs(t, err, ErrProjectExists)
		assert.Nil(t, p2)
	})

	t.Run("initial meta is stored", func(t *testing.T) {
		st := openTestStore(t)
		p, err := st.CreateProject(CreateProjectParams{
			Name:        "meta",
			RemoteURL:   "https://example.com/m.git",
			InitialMeta: map[string]string{"k": "v"},
		})
		require.NoError(t, err)
		require.NotNil(t, p.Meta)
		assert.Equal(t, "v", p.Meta["k"])
	})
}

func TestStore_GetProject(t *testing.T) {
	t.Run("nil store returns error", func(t *testing.T) {
		var s *Store
		p, err := s.GetProject("x")
		require.Error(t, err)
		assert.Nil(t, p)
	})

	t.Run("empty name returns ErrInvalidName", func(t *testing.T) {
		st := openTestStore(t)
		p, err := st.GetProject("  ")
		require.ErrorIs(t, err, ErrInvalidName)
		assert.Nil(t, p)
	})

	t.Run("missing project returns nil without error", func(t *testing.T) {
		st := openTestStore(t)
		p, err := st.GetProject("nope")
		require.NoError(t, err)
		assert.Nil(t, p)
	})

	t.Run("returns stored project", func(t *testing.T) {
		st := openTestStore(t)
		const name = "loaded"
		created, err := st.CreateProject(CreateProjectParams{
			Name:      name,
			RemoteURL: "https://example.com/z.git",
		})
		require.NoError(t, err)

		got, err := st.GetProject(name)
		require.NoError(t, err)
		require.NotNil(t, got)
		assert.Equal(t, created.Name, got.Name)
		assert.Equal(t, created.Directory, got.Directory)
		assert.Equal(t, created.RemoteURL, got.RemoteURL)
	})
}
