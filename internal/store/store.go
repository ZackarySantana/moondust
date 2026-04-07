// Package store keeps persistence and cache layout in one place so callers do not
// import bbolt or assume where UserCacheDir points.
package store

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	bolt "go.etcd.io/bbolt"
)

const (
	appDirName     = "moondust"
	dbFileName     = "store.bolt"
	projectsSubdir = "projects"
)

// Store keeps cacheRoot alongside the DB so remote project dirs resolve under the same
// root OpenFile was given (tests can swap the root without touching process-wide env).
type Store struct {
	db        *bolt.DB
	cacheRoot string
}

// DefaultPaths uses UserCacheDir so the file lives with other discardable cache, not
// documents or config, and follows each OS's usual layout.
func DefaultPaths() (cacheRoot string, dbPath string, err error) {
	base, err := os.UserCacheDir()
	if err != nil {
		return "", "", fmt.Errorf("store: user cache dir: %w", err)
	}
	root := filepath.Join(base, appDirName)
	db := filepath.Join(root, dbFileName)
	return root, db, nil
}

func Open() (*Store, error) {
	cacheRoot, dbPath, err := DefaultPaths()
	if err != nil {
		return nil, err
	}
	return OpenFile(cacheRoot, dbPath)
}

// OpenFile splits cacheRoot from dbPath so remote clones target cacheRoot/projects/...
// regardless of where the bolt file sits, and so tests can point both at t.TempDir().
func OpenFile(cacheRoot, dbPath string) (*Store, error) {
	if err := os.MkdirAll(filepath.Dir(dbPath), 0o755); err != nil {
		return nil, fmt.Errorf("store: mkdir db parent: %w", err)
	}
	db, err := bolt.Open(dbPath, 0o600, &bolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		return nil, fmt.Errorf("store: open bolt: %w", err)
	}
	s := &Store{db: db, cacheRoot: cacheRoot}
	if err := s.ensureBuckets(); err != nil {
		_ = db.Close()
		return nil, err
	}
	if err := s.migrateProjectIDs(); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("store: migrate project ids: %w", err)
	}
	return s, nil
}

func (s *Store) ensureBuckets() error {
	return s.db.Update(func(tx *bolt.Tx) error {
		if _, err := tx.CreateBucketIfNotExists(bucketSettings); err != nil {
			return fmt.Errorf("store: settings bucket: %w", err)
		}
		if _, err := tx.CreateBucketIfNotExists(bucketProjects); err != nil {
			return fmt.Errorf("store: projects bucket: %w", err)
		}
		return nil
	})
}

func (s *Store) Close() error {
	if s == nil || s.db == nil {
		return nil
	}
	return s.db.Close()
}

// CacheRoot is exposed because the bolt path alone does not tell you where remote
// clones were created; tools that run after CreateProject need this same base.
func (s *Store) CacheRoot() string {
	if s == nil {
		return ""
	}
	return s.cacheRoot
}
