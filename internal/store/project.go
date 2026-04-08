package store

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"unicode"

	bolt "go.etcd.io/bbolt"
)

func generateProjectID() (string, error) {
	b := make([]byte, 6)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("store: generate project id: %w", err)
	}
	return hex.EncodeToString(b), nil
}

// CreateProjectParams: RemoteURL means we allocate under CacheRoot so we never write
// into arbitrary paths without a user-chosen folder; omit it when Directory comes from
// the folder picker and already exists.
type CreateProjectParams struct {
	Name        string
	RemoteURL   string
	Directory   string
	InitialMeta map[string]string
}

func (s *Store) CreateProject(p CreateProjectParams) (*Project, error) {
	if s == nil || s.db == nil {
		return nil, fmt.Errorf("store: nil store")
	}
	name := strings.TrimSpace(p.Name)
	if name == "" {
		return nil, ErrInvalidName
	}

	id, err := generateProjectID()
	if err != nil {
		return nil, err
	}

	dir, err := s.resolveProjectDirectory(name, p.RemoteURL, p.Directory)
	if err != nil {
		return nil, err
	}

	proj := Project{
		ID:        id,
		Name:      name,
		Directory: dir,
		RemoteURL: strings.TrimSpace(p.RemoteURL),
		Meta:      cloneMeta(p.InitialMeta),
	}

	key := []byte(id)
	data, err := json.Marshal(&proj)
	if err != nil {
		return nil, fmt.Errorf("store: encode project: %w", err)
	}

	err = s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(bucketProjects)
		if b == nil {
			return fmt.Errorf("store: projects bucket missing")
		}
		if b.Get(key) != nil {
			return ErrProjectExists
		}
		return b.Put(key, data)
	})
	if err != nil {
		if errors.Is(err, ErrProjectExists) {
			return nil, err
		}
		return nil, err
	}
	return &proj, nil
}

func (s *Store) resolveProjectDirectory(name, remoteURL, localDir string) (string, error) {
	remote := strings.TrimSpace(remoteURL)
	local := strings.TrimSpace(localDir)

	switch {
	case remote != "" && local != "":
		return "", fmt.Errorf("%w: set either remote URL or local directory, not both", ErrInvalidParams)
	case remote != "":
		sub := safeProjectDirName(name)
		dir := filepath.Join(s.cacheRoot, projectsSubdir, sub)
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return "", fmt.Errorf("store: mkdir project dir: %w", err)
		}
		return dir, nil
	case local != "":
		dir := filepath.Clean(local)
		st, err := os.Stat(dir)
		if err != nil {
			return "", fmt.Errorf("store: local directory %q: %w", dir, err)
		}
		if !st.IsDir() {
			return "", fmt.Errorf("store: not a directory: %s", dir)
		}
		return dir, nil
	default:
		return "", fmt.Errorf("%w: need remote URL or local directory", ErrInvalidParams)
	}
}

func safeProjectDirName(name string) string {
	var b strings.Builder
	for _, r := range strings.TrimSpace(name) {
		switch {
		case r == '/' || r == '\\' || r == ':' || unicode.IsControl(r):
			b.WriteRune('-')
		case unicode.IsSpace(r):
			b.WriteRune('-')
		default:
			b.WriteRune(r)
		}
	}
	s := strings.Trim(b.String(), "-")
	if s == "" {
		return "project"
	}
	return s
}

func cloneMeta(m map[string]string) map[string]string {
	if len(m) == 0 {
		return nil
	}
	out := make(map[string]string, len(m))
	for k, v := range m {
		out[k] = v
	}
	return out
}

// GetProject returns nil when missing so callers can branch on nil instead of
// importing a sentinel "not found" error for the common lookup case.
func (s *Store) GetProject(id string) (*Project, error) {
	if s == nil || s.db == nil {
		return nil, fmt.Errorf("store: nil store")
	}
	key := []byte(strings.TrimSpace(id))
	if len(key) == 0 {
		return nil, ErrInvalidName
	}
	var out *Project
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(bucketProjects)
		if b == nil {
			return nil
		}
		v := b.Get(key)
		if v == nil {
			return nil
		}
		var p Project
		if err := json.Unmarshal(v, &p); err != nil {
			return fmt.Errorf("store: decode project: %w", err)
		}
		out = &p
		return nil
	})
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (s *Store) ListProjects() ([]Project, error) {
	if s == nil || s.db == nil {
		return nil, fmt.Errorf("store: nil store")
	}
	var out []Project
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(bucketProjects)
		if b == nil {
			return nil
		}
		return b.ForEach(func(_, v []byte) error {
			var p Project
			if err := json.Unmarshal(v, &p); err != nil {
				return fmt.Errorf("store: decode project: %w", err)
			}
			out = append(out, p)
			return nil
		})
	})
	if err != nil {
		return nil, err
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out, nil
}

// UpdateProject replaces the stored JSON for an existing project. The ID is immutable
// and used as the bolt key; all other fields (including Name) can change.
func (s *Store) UpdateProject(p *Project) error {
	if s == nil || s.db == nil {
		return fmt.Errorf("store: nil store")
	}
	id := strings.TrimSpace(p.ID)
	if id == "" {
		return ErrInvalidName
	}
	key := []byte(id)

	data, err := json.Marshal(p)
	if err != nil {
		return fmt.Errorf("store: encode project: %w", err)
	}
	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(bucketProjects)
		if b == nil {
			return fmt.Errorf("store: projects bucket missing")
		}
		if b.Get(key) == nil {
			return ErrProjectNotFound
		}
		return b.Put(key, data)
	})
}

// DeleteProject only removes the bolt key; callers remove files when rolling back.
func (s *Store) DeleteProject(id string) error {
	if s == nil || s.db == nil {
		return fmt.Errorf("store: nil store")
	}
	key := []byte(strings.TrimSpace(id))
	if len(key) == 0 {
		return ErrInvalidName
	}
	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(bucketProjects)
		if b == nil {
			return fmt.Errorf("store: projects bucket missing")
		}
		if b.Get(key) == nil {
			return ErrProjectNotFound
		}
		return b.Delete(key)
	})
}
