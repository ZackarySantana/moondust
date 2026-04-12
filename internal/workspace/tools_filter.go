package workspace

// FilterToolDefinitions keeps only tools whose names are enabled[key] == true.
// nil enabled means all definitions pass through. Missing keys are treated as enabled.
func FilterToolDefinitions(defs []ToolDefinition, enabled map[string]bool) []ToolDefinition {
	if enabled == nil {
		return defs
	}
	out := make([]ToolDefinition, 0, len(defs))
	for i := range defs {
		name := defs[i].Function.Name
		if toolDefinitionEnabled(name, enabled) {
			out = append(out, defs[i])
		}
	}
	return out
}

func toolDefinitionEnabled(name string, enabled map[string]bool) bool {
	if enabled == nil {
		return true
	}
	v, ok := enabled[name]
	if !ok {
		return true
	}
	return v
}
