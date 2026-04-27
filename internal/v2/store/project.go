package store

import "time"

type Project struct {
	ID string

	// Name is the human-readable project name shown in the workspace rail.
	Name string

	// Directory is the absolute filesystem path to the project root.
	Directory string

	// Branch is the currently checked-out git branch, if known.
	Branch string

	// CreatedAt and UpdatedAt are assigned by the store implementation on Put and Update; callers should leave them zero.
	CreatedAt time.Time
	UpdatedAt time.Time
}

type ProjectStore interface {
	Store[Project]
}
