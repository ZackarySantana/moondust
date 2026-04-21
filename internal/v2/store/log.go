package store

import (
	"time"
)

type Log struct {
	ID string

	Level   string
	Message string

	CreatedAt time.Time
}

type LogStore interface {
	Store[Log]
}
