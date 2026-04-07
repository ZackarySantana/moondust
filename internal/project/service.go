// Package project runs workspace flows without Wails on the import graph.
package project

import (
	"context"
	"errors"
	"fmt"
	"os"

	"moondust/internal/git"
	"moondust/internal/store"
)

type Service struct {
	store     *store.Store
	gitClient git.Client
}

func NewService(st *store.Store, g git.Client) *Service {
	if st == nil || g == nil {
		return nil
	}
	return &Service{store: st, gitClient: g}
}

func (s *Service) Close() error {
	if s == nil || s.store == nil {
		return nil
	}
	return s.store.Close()
}

func (s *Service) CreateProjectFromRemote(ctx context.Context, name, remoteURL string) (*store.Project, error) {
	if s == nil {
		return nil, fmt.Errorf("project: nil service")
	}
	p, err := s.store.CreateProject(store.CreateProjectParams{
		Name:      name,
		RemoteURL: remoteURL,
	})
	if err != nil {
		return nil, err
	}
	if err := s.gitClient.Clone(ctx, remoteURL, p.Directory); err != nil {
		rbErr := s.rollbackRemoteCreate(p)
		return nil, errors.Join(fmt.Errorf("project: clone: %w", err), rbErr)
	}
	return p, nil
}

func (s *Service) CreateProjectFromFolder(ctx context.Context, name, directory string) (*store.Project, error) {
	if s == nil {
		return nil, fmt.Errorf("project: nil service")
	}
	_ = ctx
	return s.store.CreateProject(store.CreateProjectParams{
		Name:      name,
		Directory: directory,
	})
}

func (s *Service) GetProject(id string) (*store.Project, error) {
	if s == nil {
		return nil, fmt.Errorf("project: nil service")
	}
	return s.store.GetProject(id)
}

func (s *Service) ListProjects() ([]store.Project, error) {
	if s == nil {
		return nil, fmt.Errorf("project: nil service")
	}
	return s.store.ListProjects()
}

func (s *Service) UpdateProject(p *store.Project) error {
	if s == nil {
		return fmt.Errorf("project: nil service")
	}
	return s.store.UpdateProject(p)
}

func (s *Service) rollbackRemoteCreate(p *store.Project) error {
	return errors.Join(
		s.store.DeleteProject(p.ID),
		os.RemoveAll(p.Directory),
	)
}
