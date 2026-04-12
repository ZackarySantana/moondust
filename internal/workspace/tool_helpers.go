// Shared helpers for optional workspace tools.

package workspace

import (
	"encoding/json"
	"fmt"
)

func decodeToolArgs(argumentsJSON string, v interface{}) error {
	if err := json.Unmarshal([]byte(argumentsJSON), v); err != nil {
		return fmt.Errorf("invalid arguments: %w", err)
	}
	return nil
}
