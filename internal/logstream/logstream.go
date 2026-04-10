package logstream

import (
	"context"
	"log/slog"
	"os"
	"sync"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const EventBatch = "log:batch"

type LogLine struct {
	Seq     uint64    `json:"seq"`
	Time    time.Time `json:"time"`
	Level   string    `json:"level"`
	Message string    `json:"message"`
	Extra   string    `json:"extra,omitempty"`
}

type Stream struct {
	mu sync.Mutex

	buf *ringBuffer

	emitCtx context.Context

	stopCh chan struct{}

	lastEmittedSeq uint64
}

func New() *Stream {
	return &Stream{
		buf: newRingBuffer(500),
	}
}

func (s *Stream) Install() {
	inner := slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: slog.LevelDebug})
	slog.SetDefault(slog.New(&teeHandler{inner: inner, buf: s.buf}))
}

func (s *Stream) SetEnabled(ctx context.Context, enabled bool) {
	s.mu.Lock()
	if enabled {
		s.emitCtx = ctx
		if s.stopCh != nil {
			s.mu.Unlock()
			return
		}
		s.stopCh = make(chan struct{})
		ch := s.stopCh
		s.mu.Unlock()
		go s.run(ch)
		return
	}
	if s.stopCh != nil {
		close(s.stopCh)
		s.stopCh = nil
	}
	s.mu.Unlock()
}

func (s *Stream) Shutdown() {
	s.SetEnabled(context.Background(), false)
}

func (s *Stream) Snapshot() []LogLine {
	return s.buf.snapshot()
}

func (s *Stream) run(stop <-chan struct{}) {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-stop:
			return
		case <-ticker.C:
			s.flush()
		}
	}
}

func (s *Stream) flush() {
	s.mu.Lock()
	ctx := s.emitCtx
	lines := s.buf.snapshotAfter(s.lastEmittedSeq)
	if len(lines) > 0 {
		s.lastEmittedSeq = lines[len(lines)-1].Seq
	}
	s.mu.Unlock()

	if ctx == nil || len(lines) == 0 {
		return
	}

	runtime.EventsEmit(ctx, EventBatch, map[string]interface{}{
		"lines": lines,
	})
}
