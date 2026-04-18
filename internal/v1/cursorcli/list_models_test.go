package cursorcli

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSanitizeCursorModelDisplayName(t *testing.T) {
	t.Run("strips current, default", func(t *testing.T) {
		assert.Equal(t,
			"Composer 2 Fast",
			sanitizeCursorModelDisplayName("Composer 2 Fast (current, default)"),
		)
	})
	t.Run("strips Current, Default casing", func(t *testing.T) {
		assert.Equal(t,
			"Composer 2 Fast",
			sanitizeCursorModelDisplayName("Composer 2 Fast (Current, Default)"),
		)
	})
	t.Run("strips lone current", func(t *testing.T) {
		assert.Equal(t, "X", sanitizeCursorModelDisplayName("X (current)"))
	})
	t.Run("strips lone default", func(t *testing.T) {
		assert.Equal(t, "X", sanitizeCursorModelDisplayName("X (default)"))
	})
	t.Run("passes through clean label", func(t *testing.T) {
		assert.Equal(t, "gpt-5.3", sanitizeCursorModelDisplayName("gpt-5.3"))
	})
}
