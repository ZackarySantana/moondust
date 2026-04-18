package store

// Agent tool names match workspace / OpenRouter tool function names.
const (
	AgentToolReadWorkspaceFile      = "read_workspace_file"
	AgentToolListWorkspaceDirectory = "list_workspace_directory"
	AgentToolEditWorkspaceFile      = "edit_workspace_file"
	AgentToolWriteWorkspaceFile     = "write_workspace_file"
	AgentToolGrepWorkspace          = "grep_workspace"
	AgentToolFindWorkspaceFiles     = "find_workspace_files"
	AgentToolWebSearch              = "web_search"
)

// DefaultAgentToolsEnabled returns all tools enabled (used when nothing is stored).
func DefaultAgentToolsEnabled() map[string]bool {
	return map[string]bool{
		AgentToolReadWorkspaceFile:      true,
		AgentToolListWorkspaceDirectory: true,
		AgentToolEditWorkspaceFile:      true,
		AgentToolWriteWorkspaceFile:     true,
		AgentToolGrepWorkspace:          true,
		AgentToolFindWorkspaceFiles:     true,
		AgentToolWebSearch:              true,
	}
}

// NormalizeAgentToolsEnabled fills missing keys with true so the map always reflects every known tool.
func NormalizeAgentToolsEnabled(m map[string]bool) map[string]bool {
	def := DefaultAgentToolsEnabled()
	out := make(map[string]bool, len(def))
	for k, defaultOn := range def {
		if m != nil {
			if v, ok := m[k]; ok {
				out[k] = v
				continue
			}
		}
		out[k] = defaultOn
	}
	return out
}
