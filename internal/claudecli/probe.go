package claudecli

import (
	"bytes"
	"context"
	"os/exec"
	"strings"
	"time"
)

const probeTimeout = 8 * time.Second

// Probe runs `claude --version` to detect installation.
func Probe(ctx context.Context) (binaryPath string, version string, probeErr string) {
	path, err := LookClaude()
	if err != nil {
		return "", "", "Install from https://docs.anthropic.com/en/docs/claude-code"
	}
	cctx, cancel := context.WithTimeout(ctx, probeTimeout)
	defer cancel()
	cmd := exec.CommandContext(cctx, path, "--version")
	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &out
	if err := cmd.Run(); err != nil {
		return path, "", strings.TrimSpace(out.String())
	}
	return path, strings.TrimSpace(out.String()), ""
}
