// Package git isolates git invocation so nothing else shells out ad hoc.
package git

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"
	"strings"

	"moondust/internal/oschild"
)

// Client is the surface for git operations the app needs (clone today; more later).
type Client interface {
	Clone(ctx context.Context, remoteURL, targetDir string) error
}

var _ Client = (*CommandClient)(nil)

type CommandClient struct{}

func NewCommandClient() *CommandClient {
	return &CommandClient{}
}

// Clone runs `git clone -- <remoteURL> <targetDir>` using the git on PATH.
func (*CommandClient) Clone(ctx context.Context, remoteURL, targetDir string) error {
	cmd := exec.CommandContext(ctx, "git", "clone", "--", remoteURL, targetDir)
	oschild.HideConsole(cmd)
	var out bytes.Buffer
	cmd.Stderr = &out
	cmd.Stdout = &out
	if err := cmd.Run(); err != nil {
		msg := strings.TrimSpace(out.String())
		if msg != "" {
			return fmt.Errorf("git clone: %w: %s", err, msg)
		}
		return fmt.Errorf("git clone: %w", err)
	}
	return nil
}
