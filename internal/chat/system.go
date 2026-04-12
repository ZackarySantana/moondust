package chat

import "strings"

// DefaultSystemPrompt is sent as the system message on every chat completion (not persisted as a row).
const DefaultSystemPrompt = `You are Moondust, an AI assistant in a desktop developer workspace. Help with code, Git, terminals, and project questions. Be concise and direct. Use fenced markdown code blocks when showing code.`

// WithWorkspaceDir appends tool instructions and the absolute working directory for this thread.
func WithWorkspaceDir(baseSystem, workDirAbs string) string {
	workDirAbs = strings.TrimSpace(workDirAbs)
	if workDirAbs == "" {
		return baseSystem
	}
	return baseSystem + "\n\nYou have tools under this thread’s working directory (paths are relative): read/list/edit files; grep and find files; write new files; plus web_search for public information. Working directory:\n" + workDirAbs
}
