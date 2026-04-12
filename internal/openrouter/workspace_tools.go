package openrouter

import "moondust/internal/workspace"

// ChatToolsFromWorkspace returns tool definitions for filesystem access under the thread working directory.
func ChatToolsFromWorkspace() []ChatTool {
	defs := workspace.ToolSchemas()
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
