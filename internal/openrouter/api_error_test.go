package openrouter

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAPIError(t *testing.T) {
	t.Run("user not found maps to key message", func(t *testing.T) {
		err := APIError("User not found.", 401)
		require.Error(t, err)
		assert.True(t, errors.Is(err, ErrKeyInvalid))
		assert.Contains(t, err.Error(), "invalid or expired")
	})

	t.Run("user not found case insensitive", func(t *testing.T) {
		err := APIError("USER NOT FOUND", 0)
		require.Error(t, err)
		assert.True(t, errors.Is(err, ErrKeyInvalid))
	})

	t.Run("unknown message passes through with prefix", func(t *testing.T) {
		err := APIError("Model not available", 400)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "openrouter:")
		assert.Contains(t, err.Error(), "Model not available")
	})

	t.Run("empty unauthorized", func(t *testing.T) {
		err := APIError("", 401)
		require.Error(t, err)
		assert.True(t, errors.Is(err, ErrKeyInvalid))
	})

	t.Run("invalid api key phrase", func(t *testing.T) {
		err := APIError("Invalid API key", 401)
		require.Error(t, err)
		assert.True(t, errors.Is(err, ErrKeyInvalid))
	})
}
