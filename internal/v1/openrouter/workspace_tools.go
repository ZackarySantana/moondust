package openrouter

import "moondust/internal/v1/workspace"

// ChatToolsFromWorkspace returns tool definitions from workspace.ToolSchemas (core + optional grep/write/find + web search).
// enabled maps tool function names to on/off; nil or missing keys mean enabled (see workspace.FilterToolDefinitions).
func ChatToolsFromWorkspace(enabled map[string]bool) []ChatTool {
	defs := workspace.ToolSchemas()
	defs = workspace.FilterToolDefinitions(defs, enabled)
	out := make([]ChatTool, len(defs))
	for i := range defs {
		out[i] = ChatTool{
			Type: defs[i].Type,
			Function: ChatToolFunction{
				Name:        defs[i].Function.Name,
				Description: defs[i].Function.Description,
				Parameters:  defs[i].Function.Parameters,
			},
		}
	}
	return out
}
