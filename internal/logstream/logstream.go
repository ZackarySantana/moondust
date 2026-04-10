package logstream

import (
	"context"
	"fmt"
	"log/slog"
	"moondust/internal/store"
	"os"
	"sync"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const EventBatch = "log:batch"

type Stream struct {
	mu sync.Mutex

	buf   *ringBuffer
	store store.LogStore

	emitCtx context.Context

	stopCh chan struct{}

	lastEmittedSeq uint64
}

func New(st store.LogStore) *Stream {
	maxSeq, _ := st.MaxSeq(context.Background())
	return &Stream{
		buf:   newRingBuffer(500, maxSeq),
		store: st,
	}
}

func (s *Stream) Install() {
	inner := slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: slog.LevelDebug})
	appendFn := func(ctx context.Context, line store.LogLine) {
		if s.store == nil {
			return
		}
		if err := s.store.Append(ctx, line); err != nil {
			fmt.Fprintf(os.Stderr, "logstream: persist log: %v\n", err)
		}
	}
	slog.SetDefault(slog.New(&teeHandler{
		inner:      inner,
		buf:        s.buf,
		appendLine: appendFn,
	}))
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

func (s *Stream) ListLogs(ctx context.Context) ([]store.LogLine, error) {
	if s.store == nil {
		return nil, nil
	}
	return s.store.List(ctx)
}

func (s *Stream) ClearLogs(ctx context.Context) error {
	if s.store == nil {
		return nil
	}
	if err := s.store.Clear(ctx); err != nil {
		return err
	}
	s.mu.Lock()
	s.buf.reset()
	s.lastEmittedSeq = 0
	s.mu.Unlock()
	return nil
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
