// find_workspace_files: list file paths under a directory matching an optional name suffix (and prefix).
// Optional tool — delete this file and remove its registration from optional_tools.go (and tools.go) to drop it.

package workspace

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

const maxFindFilesResults = 400

func runFindWorkspaceFiles(root, argumentsJSON string) (string, error) {
	var args struct {
		Directory string `json:"directory"`
		Suffix    string `json:"suffix"`
		Prefix    string `json:"prefix"`
		Recursive *bool  `json:"recursive"`
		MaxFiles  int    `json:"max_files"`
	}
	if err := decodeToolArgs(argumentsJSON, &args); err != nil {
		return "", err
	}
	recursive := true
	if args.Recursive != nil {
		recursive = *args.Recursive
	}
	suffix := strings.TrimSpace(args.Suffix)
	prefix := strings.TrimSpace(args.Prefix)
	if suffix == "" && prefix == "" {
		return "", fmt.Errorf("provide at least one of suffix or prefix (e.g. suffix \".go\") to narrow results")
	}

	dir := strings.TrimSpace(args.Directory)
	if dir == "" {
		dir = "."
	}
	maxFiles := args.MaxFiles
	if maxFiles <= 0 {
		maxFiles = 200
	}
	if maxFiles > maxFindFilesResults {
		maxFiles = maxFindFilesResults
	}

	baseAbs, err := resolveUnderRoot(root, dir)
	if err != nil {
		return "", err
	}
	fi, err := os.Stat(baseAbs)
	if err != nil {
		return "", fmt.Errorf("stat: %w", err)
	}
	if !fi.IsDir() {
		return "", fmt.Errorf("path must be a directory: %s", dir)
	}

	rootAbs, err := filepath.Abs(filepath.Clean(root))
	if err != nil {
		return "", err
	}

	var paths []string
	n := 0

	walk := func(path string, d fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return nil
		}
		if d.IsDir() {
			name := d.Name()
			if path != baseAbs && skipWalkDirNames[name] {
				return fs.SkipDir
			}
			return nil
		}
		if n >= maxFiles {
			return fs.SkipAll
		}
		base := filepath.Base(path)
		if prefix != "" && !strings.HasPrefix(base, prefix) {
			return nil
		}
		if suffix != "" && !strings.HasSuffix(base, suffix) {
			return nil
		}
		rel, err := filepath.Rel(rootAbs, path)
		if err != nil {
			return nil
		}
		paths = append(paths, filepath.ToSlash(rel))
		n++
		return nil
	}

	if recursive {
		err = filepath.WalkDir(baseAbs, walk)
	} else {
		entries, err := os.ReadDir(baseAbs)
		if err != nil {
			return "", fmt.Errorf("read directory: %w", err)
		}
		for _, e := range entries {
			if n >= maxFiles {
				break
			}
			if e.IsDir() {
				continue
			}
			name := e.Name()
			if prefix != "" && !strings.HasPrefix(name, prefix) {
				continue
			}
			if suffix != "" && !strings.HasSuffix(name, suffix) {
				continue
			}
			full := filepath.Join(baseAbs, name)
			relOut, err := filepath.Rel(rootAbs, full)
			if err != nil {
				continue
			}
			paths = append(paths, filepath.ToSlash(relOut))
			n++
		}
	}
	if err != nil {
		return "", err
	}

	sort.Strings(paths)
	out := strings.Join(paths, "\n")
	if out == "" {
		return truncateToolOutput("No files matched."), nil
	}
	if len(paths) >= maxFiles {
		out += fmt.Sprintf("\n\n… truncated (max %d paths)", maxFiles)
	}
	return truncateToolOutput(out), nil
}
