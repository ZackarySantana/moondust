package run

import (
	"context"
	"io"
)

type Executor interface {
	LookPath(ctx context.Context) (string, error)
	QuickRun(ctx context.Context, args ...string) ([]byte, error)
	Run(ctx context.Context, args ...string) (io.ReadCloser, io.ReadCloser, error)
}
