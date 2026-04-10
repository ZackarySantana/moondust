package logstream

import (
	"sync"
)

type ringBuffer struct {
	mu sync.Mutex

	buf []LogLine
	cap int

	nextSeq uint64
}

func newRingBuffer(capacity int) *ringBuffer {
	return &ringBuffer{cap: capacity}
}

func (b *ringBuffer) append(line LogLine) {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.nextSeq++
	line.Seq = b.nextSeq

	if len(b.buf) >= b.cap {
		b.buf = b.buf[1:]
	}
	b.buf = append(b.buf, line)
}

func (b *ringBuffer) snapshot() []LogLine {
	b.mu.Lock()
	defer b.mu.Unlock()

	out := make([]LogLine, len(b.buf))
	copy(out, b.buf)
	return out
}

func (b *ringBuffer) snapshotAfter(seq uint64) []LogLine {
	b.mu.Lock()
	defer b.mu.Unlock()

	var out []LogLine
	for _, line := range b.buf {
		if line.Seq > seq {
			out = append(out, line)
		}
	}
	return out
}
