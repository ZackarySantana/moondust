package store

import (
	"context"
	"time"
)

type LogLine struct {
	Seq     uint64    `json:"seq"`
	Time    time.Time `json:"time"`
	Level   string    `json:"level"`
	Message string    `json:"message"`
	Extra   string    `json:"extra,omitempty"`
}

type LogStore interface {
	Append(ctx context.Context, line LogLine) error
	List(ctx context.Context) ([]LogLine, error)
	Clear(ctx context.Context) error
	MaxSeq(ctx context.Context) (uint64, error)
}
