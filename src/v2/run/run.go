package run

import "context"

type Executor interface {
	QuickRun(ctx context.Context, path string, args ...string) ([]byte, error)
	LookPath(ctx context.Context, binaryName string) (string, error)
}
