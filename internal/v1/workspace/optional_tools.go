// Optional agent tools (grep, write new file, find files by name).
//
// Removal: delete optional_tools.go, tool_grep_workspace.go, tool_write_workspace.go,
// tool_find_workspace_files.go, and tool_helpers.go (if nothing else uses decodeToolArgs).
// In tools.go: remove OptionalToolSchemas() from ToolSchemas and the three switch cases in RunTool.

package workspace

import "encoding/json"

// OptionalToolSchemas returns extra tool definitions kept separate from core read/list/edit/web_search.
func OptionalToolSchemas() []ToolDefinition {
	return []ToolDefinition{
		{
			Type: "function",
			Function: ToolFunctionSpec{
				Name:        "grep_workspace",
				Description: "Search text files under the working directory for a literal substring (not regex). Skips heavy dirs (node_modules, .git, vendor, etc.). Output lines are path:line:content.",
				Parameters:  json.RawMessage(`{"type":"object","properties":{"pattern":{"type":"string","description":"Literal text to find"},"path":{"type":"string","description":"Relative directory to search; default \".\""},"max_results":{"type":"integer","description":"Maximum matches (default 50, cap 120)"}},"required":["pattern"]}`),
			},
		},
		{
			Type: "function",
			Function: ToolFunctionSpec{
				Name:        "write_workspace_file",
				Description: "Create or overwrite a text file. Parent directories are created as needed. Use for new files; prefer edit_workspace_file for small changes to existing files.",
				Parameters:  json.RawMessage(`{"type":"object","properties":{"path":{"type":"string","description":"Relative file path"},"content":{"type":"string","description":"Full file contents"}},"required":["path","content"]}`),
			},
		},
		{
			Type: "function",
			Function: ToolFunctionSpec{
				Name:        "find_workspace_files",
				Description: "List file paths matching a filename suffix and/or prefix under a directory. Provide at least one of suffix or prefix. Skips heavy dirs when recursive. Default recursive is true.",
				Parameters:  json.RawMessage(`{"type":"object","properties":{"directory":{"type":"string","description":"Relative directory; default \".\""},"suffix":{"type":"string","description":"Filename suffix e.g. .go or .tsx"},"prefix":{"type":"string","description":"Filename prefix"},"recursive":{"type":"boolean","description":"Include subdirectories (default true)"},"max_files":{"type":"integer","description":"Max paths (default 200, cap 400)"}}}`),
			},
		},
	}
}
