package openrouter

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
)

// ErrKeyInvalid means OpenRouter rejected the API key (wrong, expired, revoked, etc.).
// The API sometimes uses misleading wording (e.g. "User not found"); APIError maps those to this value.
var ErrKeyInvalid = errors.New(
	"Your OpenRouter API key is invalid or expired. Update it in Settings → Providers.",
)

// APIError turns OpenRouter HTTP/JSON error payloads into errors safe to show in the UI.
func APIError(message string, httpStatus int) error {
	message = strings.TrimSpace(message)
	lower := strings.ToLower(message)

	if strings.Contains(lower, "user not found") {
		return ErrKeyInvalid
	}

	if strings.Contains(lower, "invalid api key") ||
		strings.Contains(lower, "incorrect api key") ||
		strings.Contains(lower, "no auth credentials") {
		return ErrKeyInvalid
	}

	if httpStatus == http.StatusUnauthorized && message == "" {
		return ErrKeyInvalid
	}

	if message != "" {
		return fmt.Errorf("openrouter: %s", message)
	}
	if httpStatus > 0 {
		return fmt.Errorf("openrouter: HTTP %d", httpStatus)
	}
	return errors.New("openrouter: request failed")
}
