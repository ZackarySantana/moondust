package cursor

import (
	"moondust/src/v2/run"
)

type Options struct {
	binaryName string

	executor run.Executor
}

func defaultOptions() *Options {
	return &Options{
		binaryName: "agent",
		executor:   run.Default(),
	}
}

type Option func(*Options)

func WithBinaryName(binaryName string) Option {
	return func(o *Options) {
		o.binaryName = binaryName
	}
}

func WithCommandRunner(runner run.Executor) Option {
	return func(o *Options) {
		o.executor = runner
	}
}
