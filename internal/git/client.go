// Package git isolates git invocation so nothing else shells out ad hoc.
package git

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"
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
// GIT_TERMINAL_PROMPT=0 avoids blocking on interactive credential prompts in the GUI.
func (*CommandClient) Clone(ctx context.Context, remoteURL, targetDir string) error {
	cmd := exec.CommandContext(ctx, "git", "clone", "--", remoteURL, targetDir)
	hideExecWindow(cmd)
	cmd.Env = append(os.Environ(), "GIT_TERMINAL_PROMPT=0")
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
