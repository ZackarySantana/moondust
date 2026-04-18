package cursorcli

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestStripANSI(t *testing.T) {
	t.Parallel()

	t.Run("clears CSI cursor and erase", func(t *testing.T) {
		t.Parallel()
		in := "\x1b[2K\x1b[GStarting login...\n\x1b[1A\x1b[2K\x1b[Gdone"
		got := StripANSI(in)
		assert.NotContains(t, got, "\x1b")
		assert.Contains(t, got, "Starting login")
		assert.Contains(t, got, "done")
	})

	t.Run("preserves plain text", func(t *testing.T) {
		t.Parallel()
		in := "CLI Version 1.2.3\nOK"
		assert.Equal(t, in, StripANSI(in))
	})

	t.Run("normalizes carriage returns", func(t *testing.T) {
		t.Parallel()
		assert.Equal(t, "a\nb", StripANSI("a\rb"))
	})
}
