// store defines the contracts for the store layer.
package store

import (
	"context"
	"errors"
	"strings"
)

type Project struct {
	// ID is an immutable random hex string assigned at creation, used as the bolt key
	// and in URLs. It is a string instead of a []byte to avoid JSON unmarshaling issues
	// when handing it over to the frontend.
	ID string `json:"id"`

	Name          string `json:"name"`
	Directory     string `json:"directory"`
	RemoteURL     string `json:"remote_url"`
	DefaultBranch string `json:"default_branch,omitempty"`
	// AutoFetch controls whether to run `git fetch origin` when creating a thread or forking.
	// Values: off, new_thread, fork, both (empty normalized to both when reading).
	AutoFetch string `json:"auto_fetch,omitempty"`
}

func (p *Project) Validate() error {
	if len(p.ID) == 0 {
		return errors.New("id is required")
	}
	if p.Name == "" {
		return errors.New("name is required")
	}
	if p.Directory == "" {
		return errors.New("directory is required")
	}
	if strings.TrimSpace(p.DefaultBranch) == "" {
		return errors.New("default branch is required")
	}
	return nil
}

type ProjectStore interface {
	Get(ctx context.Context, id string) (*Project, error)
	List(ctx context.Context) ([]*Project, error)
	Update(ctx context.Context, project *Project) error
	Delete(ctx context.Context, id string) error
}

var _ ProjectStore = (*ValidateProjectStore)(nil)

type ValidateProjectStore struct {
	ProjectStore ProjectStore
}

func (s *ValidateProjectStore) Get(ctx context.Context, id string) (*Project, error) {
	return s.ProjectStore.Get(ctx, id)
}

func (s *ValidateProjectStore) List(ctx context.Context) ([]*Project, error) {
	return s.ProjectStore.List(ctx)
}

func (s *ValidateProjectStore) Update(ctx context.Context, project *Project) error {
	if err := project.Validate(); err != nil {
		return err
	}
	return s.ProjectStore.Update(ctx, project)
}

func (s *ValidateProjectStore) Delete(ctx context.Context, id string) error {
	return s.ProjectStore.Delete(ctx, id)
}
