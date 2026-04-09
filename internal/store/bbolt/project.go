package bbolt

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"moondust/internal/store"

	"go.etcd.io/bbolt"
)

var (
	bucketProjects = []byte("projects")
)

func NewProject(db *bbolt.DB) store.ProjectStore {
	if db == nil {
		panic("db is nil")
	}
	return &projectStore{
		db: db,
	}
}

type projectStore struct {
	db *bbolt.DB
}

func (s *projectStore) Get(ctx context.Context, id string) (*store.Project, error) {
	var project *store.Project
	err := s.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketProjects)
		if bucket == nil {
			return nil
		}
		rawProject := bucket.Get([]byte(id))
		if err := json.Unmarshal(rawProject, &project); err != nil {
			return fmt.Errorf("unmarshal project: %w", err)
		}
		return nil
	})
	return project, err
}

func (s *projectStore) List(ctx context.Context) ([]*store.Project, error) {
	var projects []*store.Project
	err := s.db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketProjects)
		if bucket == nil {
			return nil
		}
		return bucket.ForEach(func(k, v []byte) error {
			var project store.Project
			if err := json.Unmarshal(v, &project); err != nil {
				return fmt.Errorf("unmarshal project: %w", err)
			}
			projects = append(projects, &project)
			return nil
		})
	})
	return projects, err
}

func (s *projectStore) Update(ctx context.Context, project *store.Project) error {
	data, err := json.Marshal(project)
	if err != nil {
		return fmt.Errorf("marshal project: %w", err)
	}

	return s.db.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketProjects)
		if bucket == nil {
			var err error
			bucket, err = tx.CreateBucket(bucketProjects)
			if err != nil {
				return fmt.Errorf("create bucket: %w", err)
			}
		}
		if bucket.Get([]byte(project.ID)) != nil {
			return errors.New("project already exists")
		}
		return bucket.Put([]byte(project.ID), data)
	})
}

func (s *projectStore) Delete(ctx context.Context, id string) error {
	return s.db.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketProjects)
		if bucket == nil {
			return nil
		}
		return bucket.Delete([]byte(id))
	})
}
