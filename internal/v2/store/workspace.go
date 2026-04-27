package store

import "time"

type Workspace struct {
	ID string

	// Name is the human-readable label shown in the workspace rail.
	Name string

	// Directory is the absolute filesystem path to the workspace root.
	Directory string

	// Branch is the git branch new worktrees are created from (integration / default base).
	Branch string

	// CreatedAt and UpdatedAt are assigned by the store implementation on Put and Update; callers should leave them zero.
	CreatedAt time.Time
	UpdatedAt time.Time
}

type WorkspaceStore interface {
	Store[Workspace]
}
