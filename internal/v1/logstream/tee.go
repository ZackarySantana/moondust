package logstream

import (
	"context"
	"fmt"
	"log/slog"
	"moondust/internal/v1/store"
	"strings"
)

var _ slog.Handler = (*teeHandler)(nil)

type teeHandler struct {
	inner slog.Handler
	buf   *ringBuffer

	appendLine func(ctx context.Context, line store.LogLine)
}

func (h *teeHandler) Enabled(ctx context.Context, level slog.Level) bool {
	return h.inner.Enabled(ctx, level)
}

func (h *teeHandler) Handle(ctx context.Context, r slog.Record) error {
	err := h.inner.Handle(ctx, r)

	var b strings.Builder
	r.Attrs(func(a slog.Attr) bool {
		if b.Len() > 0 {
			b.WriteString(" ")
		}
		b.WriteString(a.Key)
		b.WriteString("=")
		b.WriteString(fmt.Sprint(a.Value.Any()))
		return true
	})

	line := store.LogLine{
		Time:    r.Time,
		Level:   r.Level.String(),
		Message: r.Message,
		Extra:   b.String(),
	}
	line = h.buf.append(line)
	if h.appendLine != nil {
		h.appendLine(ctx, line)
	}

	return err
}

func (h *teeHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return &teeHandler{inner: h.inner.WithAttrs(attrs), buf: h.buf, appendLine: h.appendLine}
}

func (h *teeHandler) WithGroup(name string) slog.Handler {
	return &teeHandler{inner: h.inner.WithGroup(name), buf: h.buf, appendLine: h.appendLine}
}
