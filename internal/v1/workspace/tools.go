// Package workspace implements sandboxed filesystem helpers for agent tools.
package workspace

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

const (
	maxReadFileBytes = 256 * 1024
	maxListEntries   = 200
	maxToolOutput    = 80_000
)

// ToolSchemas returns OpenAI-style tool definitions (JSON parameters as raw schema).
func ToolSchemas() []ToolDefinition {
	core := []ToolDefinition{
		{
			Type: "function",
			Function: ToolFunctionSpec{
				Name:        "read_workspace_file",
				Description: "Read a text file under the thread working directory. Paths are relative to that root (use forward slashes).",
				Parameters:  json.RawMessage(`{"type":"object","properties":{"path":{"type":"string","description":"Relative path, e.g. src/main.go or README.md"}},"required":["path"]}`),
			},
		},
		{
			Type: "function",
			Function: ToolFunctionSpec{
				Name:        "list_workspace_directory",
				Description: "List files and subdirectories in a path under the working directory (non-recursive).",
				Parameters:  json.RawMessage(`{"type":"object","properties":{"path":{"type":"string","description":"Relative directory; use . or empty for root of working directory"}}}`),
			},
		},
		{
			Type: "function",
			Function: ToolFunctionSpec{
				Name:        "edit_workspace_file",
				Description: "Edit a text file by replacing exactly one occurrence of old_string with new_string. Read the file first and copy the exact text to change (whitespace must match). Fails if old_string is missing or appears more than once.",
				Parameters:  json.RawMessage(`{"type":"object","properties":{"path":{"type":"string","description":"Relative path to the file"},"old_string":{"type":"string","description":"Exact substring to replace once"},"new_string":{"type":"string","description":"Replacement text (may be empty to delete the match)"}},"required":["path","old_string","new_string"]}`),
			},
		},
		{
			Type: "function",
			Function: ToolFunctionSpec{
				Name:        "web_search",
				Description: "Search the public web for current information, documentation, error messages, or facts not present in the workspace. Uses DuckDuckGo instant answers; results may be brief or empty for some queries.",
				Parameters:  json.RawMessage(`{"type":"object","properties":{"query":{"type":"string","description":"Web search query (keywords or a short question)"}},"required":["query"]}`),
			},
		},
	}
	return append(core, OptionalToolSchemas()...)
}

// ToolDefinition is one tool entry for the chat completions API.
type ToolDefinition struct {
	Type     string           `json:"type"`
	Function ToolFunctionSpec `json:"function"`
}

// ToolFunctionSpec is the function sub-object of a tool definition.
type ToolFunctionSpec struct {
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Parameters  json.RawMessage `json:"parameters"`
}

// RunTool executes a tool by name with JSON arguments against root (absolute path).
func RunTool(root, name, argumentsJSON string) (string, error) {
	root = filepath.Clean(root)
	fi, err := os.Stat(root)
	if err != nil {
		return "", fmt.Errorf("working directory: %w", err)
	}
	if !fi.IsDir() {
		return "", fmt.Errorf("working directory is not a directory")
	}

	switch name {
	case "read_workspace_file":
		var args struct {
			Path string `json:"path"`
		}
		if err := json.Unmarshal([]byte(argumentsJSON), &args); err != nil {
			return "", fmt.Errorf("invalid arguments: %w", err)
		}
		return readFileUnderRoot(root, args.Path)
	case "list_workspace_directory":
		var args struct {
			Path string `json:"path"`
		}
		_ = json.Unmarshal([]byte(argumentsJSON), &args)
		return listDirUnderRoot(root, args.Path)
	case "edit_workspace_file":
		var args struct {
			Path      string `json:"path"`
			OldString string `json:"old_string"`
			NewString string `json:"new_string"`
		}
		if err := json.Unmarshal([]byte(argumentsJSON), &args); err != nil {
			return "", fmt.Errorf("invalid arguments: %w", err)
		}
		return editFileUnderRoot(root, args.Path, args.OldString, args.NewString)
	case "web_search":
		var args struct {
			Query string `json:"query"`
		}
		if err := json.Unmarshal([]byte(argumentsJSON), &args); err != nil {
			return "", fmt.Errorf("invalid arguments: %w", err)
		}
		return runWebSearch(args.Query)
	case "grep_workspace":
		return runGrepWorkspace(root, argumentsJSON)
	case "write_workspace_file":
		return runWriteWorkspaceFile(root, argumentsJSON)
	case "find_workspace_files":
		return runFindWorkspaceFiles(root, argumentsJSON)
	default:
		return "", fmt.Errorf("unknown tool %q", name)
	}
}

func resolveUnderRoot(root, rel string) (string, error) {
	rootAbs, err := filepath.Abs(filepath.Clean(root))
	if err != nil {
		return "", fmt.Errorf("working directory: %w", err)
	}
	rel = strings.TrimSpace(rel)
	if rel == "" || rel == "." {
		return rootAbs, nil
	}
	rel = filepath.FromSlash(strings.TrimPrefix(rel, "/"))
	if filepath.IsAbs(rel) {
		return "", fmt.Errorf("absolute paths are not allowed")
	}
	rel = filepath.Clean(rel)
	if rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return "", fmt.Errorf("path escapes working directory")
	}
	full, err := filepath.Abs(filepath.Join(rootAbs, rel))
	if err != nil {
		return "", err
	}
	sep := string(filepath.Separator)
	if full != rootAbs && !strings.HasPrefix(full+sep, rootAbs+sep) {
		return "", fmt.Errorf("path escapes working directory")
	}
	return full, nil
}

func readFileUnderRoot(root, rel string) (string, error) {
	full, err := resolveUnderRoot(root, rel)
	if err != nil {
		return "", err
	}
	data, err := os.ReadFile(full)
	if err != nil {
		return "", fmt.Errorf("read file: %w", err)
	}
	if len(data) > maxReadFileBytes {
		data = data[:maxReadFileBytes]
		s := string(data) + fmt.Sprintf("\n\n… truncated (max %d bytes)", maxReadFileBytes)
		return truncateToolOutput(s), nil
	}
	return truncateToolOutput(string(data)), nil
}

func listDirUnderRoot(root, rel string) (string, error) {
	full, err := resolveUnderRoot(root, rel)
	if err != nil {
		return "", err
	}
	fi, err := os.Stat(full)
	if err != nil {
		return "", fmt.Errorf("stat: %w", err)
	}
	if !fi.IsDir() {
		return "", fmt.Errorf("not a directory: %s", rel)
	}
	entries, err := os.ReadDir(full)
	if err != nil {
		return "", fmt.Errorf("read directory: %w", err)
	}
	if len(entries) > maxListEntries {
		entries = entries[:maxListEntries]
	}
	names := make([]string, 0, len(entries))
	for _, e := range entries {
		n := e.Name()
		if e.IsDir() {
			n += "/"
		}
		names = append(names, n)
	}
	sort.Strings(names)
	out := strings.Join(names, "\n")
	if len(entries) >= maxListEntries {
		out += fmt.Sprintf("\n\n… listing truncated (max %d entries)", maxListEntries)
	}
	return truncateToolOutput(out), nil
}

func truncateToolOutput(s string) string {
	if len(s) <= maxToolOutput {
		return s
	}
	runes := []rune(s)
	if len(runes) <= maxToolOutput {
		return s
	}
	return string(runes[:maxToolOutput]) + "\n\n… (tool output truncated)"
}
