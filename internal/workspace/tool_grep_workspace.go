// grep_workspace: literal substring search across text files under the working tree.
// Optional tool — delete this file and remove its registration from optional_tools.go (and tools.go) to drop it.

package workspace

import (
	"bufio"
	"bytes"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

const (
	maxGrepPatternRunes = 512
	maxGrepResults      = 120
	maxGrepFileBytes    = 256 * 1024
	maxGrepLineBytes    = 8192
)

// skipWalkDirNames are directory names we do not descend into (large or irrelevant trees).
var skipWalkDirNames = map[string]bool{
	".git":         true,
	"node_modules": true,
	"vendor":       true,
	"dist":         true,
	"build":        true,
	".next":        true,
	"target":       true,
	"__pycache__":  true,
	".venv":        true,
	"venv":         true,
}

func runGrepWorkspace(root, argumentsJSON string) (string, error) {
	var args struct {
		Pattern    string `json:"pattern"`
		Path       string `json:"path"`
		MaxResults int    `json:"max_results"`
	}
	if err := decodeToolArgs(argumentsJSON, &args); err != nil {
		return "", err
	}
	pattern := strings.TrimSpace(args.Pattern)
	if pattern == "" {
		return "", fmt.Errorf("pattern is required")
	}
	if len([]rune(pattern)) > maxGrepPatternRunes {
		return "", fmt.Errorf("pattern too long (max %d characters)", maxGrepPatternRunes)
	}
	searchRoot := strings.TrimSpace(args.Path)
	if searchRoot == "" {
		searchRoot = "."
	}
	maxRes := args.MaxResults
	if maxRes <= 0 {
		maxRes = 50
	}
	if maxRes > maxGrepResults {
		maxRes = maxGrepResults
	}

	baseAbs, err := resolveUnderRoot(root, searchRoot)
	if err != nil {
		return "", err
	}
	fi, err := os.Stat(baseAbs)
	if err != nil {
		return "", fmt.Errorf("stat: %w", err)
	}
	if !fi.IsDir() {
		return "", fmt.Errorf("path must be a directory: %s", searchRoot)
	}

	rootAbs, err := filepath.Abs(filepath.Clean(root))
	if err != nil {
		return "", err
	}

	var hits []string
	n := 0
	err = filepath.WalkDir(baseAbs, func(path string, d fs.DirEntry, walkErr error) error {
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
		if n >= maxRes {
			return fs.SkipAll
		}
		data, err := os.ReadFile(path)
		if err != nil || len(data) > maxGrepFileBytes {
			return nil
		}
		sample := data
		if len(sample) > 4096 {
			sample = sample[:4096]
		}
		if len(sample) > 0 && bytes.IndexByte(sample, 0) >= 0 {
			return nil
		}
		if !bytes.Contains(data, []byte(pattern)) {
			return nil
		}
		rel, err := filepath.Rel(rootAbs, path)
		if err != nil {
			rel = path
		}
		rel = filepath.ToSlash(rel)
		sc := bufio.NewScanner(bytes.NewReader(data))
		lineNo := 0
		for sc.Scan() {
			lineNo++
			if n >= maxRes {
				break
			}
			line := sc.Bytes()
			if len(line) > maxGrepLineBytes {
				continue
			}
			if !bytes.Contains(line, []byte(pattern)) {
				continue
			}
			s := strings.TrimRight(string(line), "\r\n")
			hits = append(hits, fmt.Sprintf("%s:%d:%s", rel, lineNo, s))
			n++
		}
		_ = sc.Err()
		if n >= maxRes {
			return fs.SkipAll
		}
		return nil
	})
	if err != nil {
		return "", err
	}
	sort.Strings(hits)
	out := strings.Builder{}
	for _, h := range hits {
		out.WriteString(h)
		out.WriteByte('\n')
	}
	s := strings.TrimSpace(out.String())
	if s == "" {
		return truncateToolOutput("No matches."), nil
	}
	if len(hits) >= maxRes {
		s += fmt.Sprintf("\n\n… truncated (max %d matches)", maxRes)
	}
	return truncateToolOutput(s), nil
}
