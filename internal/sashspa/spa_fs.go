package sashspa

import (
	"errors"
	"io/fs"
	"net/http"
	"path"
	"strings"
)

// FileSystem wraps an embedded SPA dist FS so GETs for unknown paths (except
// /api/* reserved for sash RPC on the mux) resolve to index.html. Without this,
// http.FileServer responds 404 to /w/:id etc., breaking refresh and any full
// document navigation while @solidjs/router expects index.html bootstrapped.
func FileSystem(dist fs.FS) http.FileSystem {
	return spaFS{http.FS(dist)}
}

type spaFS struct {
	root http.FileSystem
}

func (s spaFS) Open(name string) (http.File, error) {
	name = strings.TrimPrefix(path.Clean("/"+strings.TrimPrefix(name, "/")), "/")
	if name == "api" || strings.HasPrefix(name, "api/") {
		return nil, fs.ErrNotExist
	}

	// Root must open as a directory so http.serveFile's redirect logic does not
	// treat a trailing "/" on r.URL.Path as "directory URL" while the opened node
	// is index.html (file) — that yields "http: attempting to traverse a non-directory".
	if name == "" || name == "." {
		return s.root.Open(".")
	}

	f, err := s.root.Open(name)
	if err == nil {
		return f, nil
	}
	if !errors.Is(err, fs.ErrNotExist) {
		return nil, err
	}
	return s.root.Open("index.html")
}
