package project

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"testing"

	"moondust/internal/store"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockClient struct {
	cloned bool
	err    error
}

func (m *mockClient) Clone(context.Context, string, string) error {
	m.cloned = true
	return m.err
}

func TestNewService(t *testing.T) {
	t.Run("nil store returns nil", func(t *testing.T) {
		assert.Nil(t, NewService(nil, &mockClient{}))
	})

	t.Run("nil git client returns nil", func(t *testing.T) {
		root := t.TempDir()
		st, err := store.OpenFile(root, filepath.Join(root, "store.bolt"))
		require.NoError(t, err)
		defer func() { assert.NoError(t, st.Close()) }()
		assert.Nil(t, NewService(st, nil))
	})

	t.Run("non-nil dependencies return service", func(t *testing.T) {
		root := t.TempDir()
		st, err := store.OpenFile(root, filepath.Join(root, "store.bolt"))
		require.NoError(t, err)
		defer func() { assert.NoError(t, st.Close()) }()
		svc := NewService(st, &mockClient{})
		require.NotNil(t, svc)
	})
}

func TestClose(t *testing.T) {
	t.Run("nil receiver returns nil error", func(t *testing.T) {
		var s *Service
		assert.NoError(t, s.Close())
	})

	t.Run("closes underlying store", func(t *testing.T) {
		root := t.TempDir()
		st, err := store.OpenFile(root, filepath.Join(root, "store.bolt"))
		require.NoError(t, err)
		svc := NewService(st, &mockClient{})
		require.NotNil(t, svc)
		require.NoError(t, svc.Close())
	})
}

func TestCreateProjectFromRemote(t *testing.T) {
	t.Run("nil service returns error", func(t *testing.T) {
		var svc *Service
		_, err := svc.CreateProjectFromRemote(context.Background(), "n", "https://example.com/x.git")
		require.Error(t, err)
	})

	t.Run("CreateProject error does not call git client", func(t *testing.T) {
		root := t.TempDir()
		st, err := store.OpenFile(root, filepath.Join(root, "store.bolt"))
		require.NoError(t, err)
		defer func() { assert.NoError(t, st.Close()) }()

		m := &mockClient{}
		svc := NewService(st, m)
		_, err = svc.CreateProjectFromRemote(context.Background(), "bad", "")
		require.ErrorIs(t, err, store.ErrInvalidParams)
		assert.False(t, m.cloned)
	})

	t.Run("successful clone returns project", func(t *testing.T) {
		root := t.TempDir()
		st, err := store.OpenFile(root, filepath.Join(root, "store.bolt"))
		require.NoError(t, err)
		defer func() { assert.NoError(t, st.Close()) }()

		svc := NewService(st, &mockClient{})
		p, err := svc.CreateProjectFromRemote(context.Background(), "good", "https://example.com/repo.git")
		require.NoError(t, err)
		require.NotNil(t, p)
		assert.Equal(t, "good", p.Name)
		assert.Equal(t, "https://example.com/repo.git", p.RemoteURL)
		assert.Contains(t, p.Directory, "projects")
	})

	t.Run("failed clone rolls back bolt row and project directory", func(t *testing.T) {
		root := t.TempDir()
		st, err := store.OpenFile(root, filepath.Join(root, "store.bolt"))
		require.NoError(t, err)
		defer func() { assert.NoError(t, st.Close()) }()

		svc := NewService(st, &mockClient{err: errors.New("clone failed")})
		_, err = svc.CreateProjectFromRemote(context.Background(), "rollback-me", "https://example.com/x.git")
		require.Error(t, err)

		got, err := st.GetProject("rollback-me")
		require.NoError(t, err)
		assert.Nil(t, got)

		dir := filepath.Join(root, "projects", "rollback-me")
		_, err = os.Stat(dir)
		assert.True(t, os.IsNotExist(err))
	})

	t.Run("failed clone wraps clone error", func(t *testing.T) {
		root := t.TempDir()
		st, err := store.OpenFile(root, filepath.Join(root, "store.bolt"))
		require.NoError(t, err)
		defer func() { assert.NoError(t, st.Close()) }()

		want := errors.New("upstream refused")
		svc := NewService(st, &mockClient{err: want})
		_, err = svc.CreateProjectFromRemote(context.Background(), "wrap", "https://example.com/w.git")
		require.Error(t, err)
		assert.ErrorContains(t, err, "project: clone:")
	})

	t.Run("CreateProject duplicate name returns without calling git client", func(t *testing.T) {
		root := t.TempDir()
		st, err := store.OpenFile(root, filepath.Join(root, "store.bolt"))
		require.NoError(t, err)
		defer func() { assert.NoError(t, st.Close()) }()

		svc1 := NewService(st, &mockClient{})
		_, err = svc1.CreateProjectFromRemote(context.Background(), "dup", "https://example.com/a.git")
		require.NoError(t, err)

		m := &mockClient{}
		svc2 := NewService(st, m)
		_, err = svc2.CreateProjectFromRemote(context.Background(), "dup", "https://example.com/b.git")
		require.ErrorIs(t, err, store.ErrProjectExists)
		assert.False(t, m.cloned)
	})
}

func TestCreateProjectFromFolder(t *testing.T) {
	t.Run("registers existing local folder", func(t *testing.T) {
		root := t.TempDir()
		st, err := store.OpenFile(root, filepath.Join(root, "store.bolt"))
		require.NoError(t, err)
		defer func() { assert.NoError(t, st.Close()) }()
		dir := t.TempDir()
		svc := NewService(st, &mockClient{})
		p, err := svc.CreateProjectFromFolder(context.Background(), "local", dir)
		require.NoError(t, err)
		assert.Equal(t, dir, p.Directory)
		assert.Empty(t, p.RemoteURL)
	})
}

func TestListProjects(t *testing.T) {
	t.Run("nil service returns error", func(t *testing.T) {
		var svc *Service
		list, err := svc.ListProjects()
		require.Error(t, err)
		assert.Nil(t, list)
	})

	t.Run("returns projects from store", func(t *testing.T) {
		root := t.TempDir()
		st, err := store.OpenFile(root, filepath.Join(root, "store.bolt"))
		require.NoError(t, err)
		defer func() { assert.NoError(t, st.Close()) }()
		_, err = st.CreateProject(store.CreateProjectParams{
			Name:      "x",
			RemoteURL: "https://example.com/r.git",
		})
		require.NoError(t, err)
		svc := NewService(st, &mockClient{})
		list, err := svc.ListProjects()
		require.NoError(t, err)
		require.Len(t, list, 1)
		assert.Equal(t, "x", list[0].Name)
	})
}
