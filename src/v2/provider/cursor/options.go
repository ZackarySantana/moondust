package cursor

import (
	"moondust/src/v2/run"
)

type Options struct {
	executor run.Executor
}

func defaultOptions() *Options {
	return &Options{
		executor: run.Default("agent"),
	}
}

type Option func(*Options)

func WithCommandRunner(runner run.Executor) Option {
	return func(o *Options) {
		o.executor = runner
	}
}
