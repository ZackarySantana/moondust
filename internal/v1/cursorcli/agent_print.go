package cursorcli

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

// AgentStreamUsage is token usage from a successful `result` line in stream-json output.
type AgentStreamUsage = agentstream.StreamUsage

// StreamPrintHeadless runs `agent --print` with stream-json and calls onDelta for each
// partial assistant text segment (events that include timestamp_ms). Returns the final
// assistant text from the result line when successful.
// onToolRound is optional; when non-nil, receives each completed tool_call from the stream.
func StreamPrintHeadless(
	ctx context.Context,
	agentPath, workspace, model, prompt string,
	onDelta func(string) error,
	onToolRound func([]store.OpenRouterToolCallRecord) error,
) (final string, usage *AgentStreamUsage, err error) {
	prompt = strings.TrimSpace(prompt)
	if prompt == "" {
		return "", nil, fmt.Errorf("cursor agent: empty prompt")
	}
	if model == "" {
		model = "composer-2-fast"
	}

	cctx, cancel := context.WithTimeout(ctx, agentPrintTimeout)
	defer cancel()

	args := []string{
		"--print",
		"--trust",
		"--workspace", workspace,
		"--model", model,
		"--output-format", "stream-json",
		"--stream-partial-output",
	}
	cmd := exec.CommandContext(cctx, agentPath, args...)
	// Windows: default child stdin is NUL (EOF). The agent CLI treats non-TTY stdin as the
	// prompt source, so it can ignore the positional prompt and see an empty task—then it
	// answers with a generic greeting. Other platforms keep argv so we match typical CLI use.
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
		return "", nil, fmt.Errorf("cursor agent: %w", err)
	}

	finalText, usage, scanErr := agentstream.ConsumeStreamJSON(stdout, onDelta, onToolRound, "cursor agent")
	waitErr := cmd.Wait()
	if waitErr != nil {
		msg := strings.TrimSpace(stderrBuf.String())
		if msg != "" {
			return "", nil, fmt.Errorf("cursor agent: %w: %s", waitErr, StripANSI(msg))
		}
		return "", nil, fmt.Errorf("cursor agent: %w", waitErr)
	}
	if scanErr != nil {
		return "", nil, scanErr
	}
	return finalText, usage, nil
}
