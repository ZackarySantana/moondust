package run

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

const (
	quickRunTimeout = 10 * time.Second
)

var (
	ErrTimeout = errors.New("timeout")
)

func Default(binary string) Executor {
	return &executor{binary: binary}
}

type executor struct {
	binary string
}

func (e *executor) LookPath(_ context.Context) (string, error) {
	p, err := exec.LookPath(e.binary)
	if err == nil {
		return p, nil
	}
	if runtime.GOOS == "windows" {
		p, err := exec.LookPath(e.binary + ".exe")
		if err == nil {
			return p, nil
		}
	}
	return "", fmt.Errorf("binary '%s' not found: %w", e.binary, err)
}

func (e *executor) QuickRun(ctx context.Context, args ...string) ([]byte, error) {
	ctx, cancel := context.WithTimeoutCause(ctx, quickRunTimeout, ErrTimeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, e.binary, args...)
	hideConsole(cmd)

	out, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("running command '%s %s': %w", e.binary, strings.Join(args, " "), err)
	}
	return out, nil
}

func (e *executor) Run(ctx context.Context, args ...string) (io.ReadCloser, io.ReadCloser, error) {
	cmd := exec.CommandContext(ctx, e.binary, args...)
	hideConsole(cmd)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, nil, fmt.Errorf("creating stdout pipe: %w", err)
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return nil, nil, fmt.Errorf("creating stderr pipe: %w", err)
	}
	if err := cmd.Start(); err != nil {
		return nil, nil, fmt.Errorf("starting command '%s %s': %w", e.binary, strings.Join(args, " "), err)
	}
	return stdout, stderr, nil
}
