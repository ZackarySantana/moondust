package claudecli

import (
	"bytes"
	"context"
	"fmt"
	"moondust/internal/v1/agentstream"
	"moondust/internal/v1/oschild"
	"moondust/internal/v1/store"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

const agentPrintTimeout = 30 * time.Minute

// StreamUsage is token usage from stream-json result events.
type StreamUsage = agentstream.StreamUsage

// StreamPrintHeadless runs `claude -p` with stream-json (same NDJSON shape as Cursor agent).
func StreamPrintHeadless(
	ctx context.Context,
	claudePath, workspace, model, prompt string,
	onDelta func(string) error,
	onToolRound func([]store.OpenRouterToolCallRecord) error,
) (final string, usage *StreamUsage, err error) {
	prompt = strings.TrimSpace(prompt)
	if prompt == "" {
		return "", nil, fmt.Errorf("claude code: empty prompt")
	}
	if model == "" {
		model = "sonnet"
	}

	cctx, cancel := context.WithTimeout(ctx, agentPrintTimeout)
	defer cancel()

	args := []string{
		"-p",
		"--verbose",
		"--output-format", "stream-json",
		"--include-partial-messages",
		"--model", model,
		"--permission-mode", "bypassPermissions",
	}
	cmd := exec.CommandContext(cctx, claudePath, args...)
	cmd.Dir = workspace
	if runtime.GOOS == "windows" {
		cmd.Stdin = strings.NewReader(prompt)
	} else {
		cmd.Args = append(cmd.Args, prompt)
	}
	oschild.HideConsole(cmd)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return "", nil, err
	}
	var stderrBuf bytes.Buffer
	cmd.Stderr = &stderrBuf

	if err := cmd.Start(); err != nil {
		return "", nil, fmt.Errorf("claude code: %w", err)
	}

	finalText, usage, scanErr := agentstream.ConsumeStreamJSON(stdout, onDelta, onToolRound, "claude code")
	waitErr := cmd.Wait()
	if waitErr != nil {
		msg := strings.TrimSpace(stderrBuf.String())
		if msg != "" {
			return "", nil, fmt.Errorf("claude code: %w: %s", waitErr, msg)
		}
		return "", nil, fmt.Errorf("claude code: %w", waitErr)
	}
	if scanErr != nil {
		return "", nil, scanErr
	}
	return finalText, usage, nil
}
