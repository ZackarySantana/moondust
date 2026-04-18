package run

import (
	"context"
	"io"
)

type Executor interface {
	LookPath(ctx context.Context, binaryName string) (string, error)
	QuickRun(ctx context.Context, path string, args ...string) ([]byte, error)
	Run(ctx context.Context, path string, args ...string) (io.ReadCloser, io.ReadCloser, error)
}
