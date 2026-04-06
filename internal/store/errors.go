package store

import "errors"

var (
	// ErrProjectExists: names are the bolt key; we reject duplicates instead of
	// auto-suffixing so the user-visible name stays what they typed.
	ErrProjectExists = errors.New("store: project already exists")

	// ErrInvalidName: empty or whitespace names cannot be used as stable bolt keys.
	ErrInvalidName = errors.New("store: invalid project name")

	// ErrInvalidParams: remote URL and local Directory are mutually exclusive on purpose
	// so we never merge two different sources of truth for one project path.
	ErrInvalidParams = errors.New("store: invalid create project parameters")

	// ErrProjectNotFound: no row for that name (e.g. delete or get).
	ErrProjectNotFound = errors.New("store: project not found")
)
