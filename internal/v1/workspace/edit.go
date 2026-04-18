package workspace

import (
	"fmt"
	"os"
	"strings"
)

// editFileUnderRoot replaces exactly one occurrence of oldString with newString in a file under root.
func editFileUnderRoot(root, rel, oldString, newString string) (string, error) {
	if oldString == "" {
		return "", fmt.Errorf("old_string must not be empty (use read_workspace_file, then copy the exact span to replace)")
	}
	full, err := resolveUnderRoot(root, rel)
	if err != nil {
		return "", err
	}
	fi, err := os.Stat(full)
	if err != nil {
		return "", fmt.Errorf("stat: %w", err)
	}
	if fi.IsDir() {
		return "", fmt.Errorf("path is a directory, not a file: %s", rel)
	}
	data, err := os.ReadFile(full)
	if err != nil {
		return "", fmt.Errorf("read file: %w", err)
	}
	if len(data) > maxReadFileBytes {
		return "", fmt.Errorf("file too large to edit (max %d bytes); choose a smaller file or split the change", maxReadFileBytes)
	}
	content := string(data)
	n := strings.Count(content, oldString)
	if n == 0 {
		return "", fmt.Errorf("old_string not found in file (read the file and match text exactly, including whitespace)")
	}
	if n > 1 {
		return "", fmt.Errorf("old_string matches %d times; it must match exactly once — narrow the snippet", n)
	}
	out := strings.Replace(content, oldString, newString, 1)
	if err := os.WriteFile(full, []byte(out), fi.Mode().Perm()); err != nil {
		return "", fmt.Errorf("write file: %w", err)
	}
	msg := fmt.Sprintf("Updated %s: replaced one occurrence (%d → %d bytes).",
		rel, len(data), len(out))
	return truncateToolOutput(msg), nil
}
