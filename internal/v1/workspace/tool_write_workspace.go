// write_workspace_file: create or overwrite a text file (parent directories are created).
// Optional tool — delete this file and remove its registration from optional_tools.go (and tools.go) to drop it.

package workspace

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const maxWriteFileBytes = 512 * 1024

func runWriteWorkspaceFile(root, argumentsJSON string) (string, error) {
	var args struct {
		Path    string `json:"path"`
		Content string `json:"content"`
	}
	if err := decodeToolArgs(argumentsJSON, &args); err != nil {
		return "", err
	}
	rel := strings.TrimSpace(args.Path)
	if rel == "" {
		return "", fmt.Errorf("path is required")
	}
	if len([]rune(args.Content)) > maxWriteFileBytes {
		return "", fmt.Errorf("content too large (max %d bytes)", maxWriteFileBytes)
	}
	full, err := resolveUnderRoot(root, rel)
	if err != nil {
		return "", err
	}
	dir := filepath.Dir(full)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", fmt.Errorf("create parent directories: %w", err)
	}
	if err := os.WriteFile(full, []byte(args.Content), 0o644); err != nil {
		return "", fmt.Errorf("write file: %w", err)
	}
	msg := fmt.Sprintf("Wrote %s (%d bytes).", filepath.ToSlash(rel), len(args.Content))
	return truncateToolOutput(msg), nil
}
