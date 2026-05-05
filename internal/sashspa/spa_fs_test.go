package sashspa_test

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"moondust/internal/sashspa"
)

func TestFileSystem(t *testing.T) {
	dist := fstest.MapFS{
		"index.html": {Data: []byte("<!doctype html><title>app</title>")},
	}

	t.Run("root does not traverse non-directory", func(t *testing.T) {
		srv := httptest.NewServer(http.FileServer(sashspa.FileSystem(dist)))
		t.Cleanup(srv.Close)

		resp, err := srv.Client().Get(srv.URL + "/")
		require.NoError(t, err)
		t.Cleanup(func() { _ = resp.Body.Close() })

		require.Equal(t, http.StatusOK, resp.StatusCode)
		body, err := io.ReadAll(io.LimitReader(resp.Body, 256<<10))
		require.NoError(t, err)
		assert.Contains(t, string(body), "<!doctype html>")
	})

	t.Run("unknown path serves spa index", func(t *testing.T) {
		srv := httptest.NewServer(http.FileServer(sashspa.FileSystem(dist)))
		t.Cleanup(srv.Close)

		resp, err := srv.Client().Get(srv.URL + "/w/some-route")
		require.NoError(t, err)
		t.Cleanup(func() { _ = resp.Body.Close() })

		require.Equal(t, http.StatusOK, resp.StatusCode)
		body, err := io.ReadAll(io.LimitReader(resp.Body, 256<<10))
		require.NoError(t, err)
		assert.Contains(t, string(body), "app")
	})

	t.Run("api prefix not served as spa", func(t *testing.T) {
		srv := httptest.NewServer(http.FileServer(sashspa.FileSystem(dist)))
		t.Cleanup(srv.Close)

		resp, err := srv.Client().Get(srv.URL + "/api/foo")
		require.NoError(t, err)
		t.Cleanup(func() { _ = resp.Body.Close() })

		require.Equal(t, http.StatusNotFound, resp.StatusCode)
	})

	t.Run("existing file wins", func(t *testing.T) {
		withAsset := fstest.MapFS{
			"index.html":   {Data: []byte("<!doctype html>")},
			"assets/x.txt": {Data: []byte("plain")},
		}
		srv := httptest.NewServer(http.FileServer(sashspa.FileSystem(withAsset)))
		t.Cleanup(srv.Close)

		resp, err := srv.Client().Get(srv.URL + "/assets/x.txt")
		require.NoError(t, err)
		t.Cleanup(func() { _ = resp.Body.Close() })

		require.Equal(t, http.StatusOK, resp.StatusCode)
		body, err := io.ReadAll(io.LimitReader(resp.Body, 64<<10))
		require.NoError(t, err)
		assert.Equal(t, "plain", strings.TrimSpace(string(body)))
	})
}
