package claudecli

import (
	"fmt"
	"os/exec"
	"runtime"
)

// LookClaude returns the resolved path to the Claude Code `claude` binary, or an error if not on PATH.
func LookClaude() (string, error) {
	p, err := exec.LookPath("claude")
	if err == nil {
		return p, nil
	}
	if runtime.GOOS == "windows" {
		p, werr := exec.LookPath("claude.exe")
		if werr == nil {
			return p, nil
		}
	}
	return "", fmt.Errorf("claude not found: %w", err)
}
