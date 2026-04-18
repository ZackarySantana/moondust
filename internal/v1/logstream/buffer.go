package logstream

import (
	"moondust/internal/v1/store"
	"sync"
)

type ringBuffer struct {
	mu sync.Mutex

	buf []store.LogLine
	cap int

	nextSeq uint64
}

func newRingBuffer(capacity int, maxSeqFromDB uint64) *ringBuffer {
	return &ringBuffer{cap: capacity, nextSeq: maxSeqFromDB}
}

func (b *ringBuffer) append(line store.LogLine) store.LogLine {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.nextSeq++
	line.Seq = b.nextSeq

	if len(b.buf) >= b.cap {
		b.buf = b.buf[1:]
	}
	b.buf = append(b.buf, line)
	return line
}

func (b *ringBuffer) reset() {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.buf = nil
	b.nextSeq = 0
}

func (b *ringBuffer) snapshot() []store.LogLine {
	b.mu.Lock()
	defer b.mu.Unlock()

	out := make([]store.LogLine, len(b.buf))
	copy(out, b.buf)
	return out
}

func (b *ringBuffer) snapshotAfter(seq uint64) []store.LogLine {
	b.mu.Lock()
	defer b.mu.Unlock()

	var out []store.LogLine
	for _, line := range b.buf {
		if line.Seq > seq {
			out = append(out, line)
		}
	}
	return out
}
