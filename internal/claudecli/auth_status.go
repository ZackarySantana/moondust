package claudecli

import (
	"bytes"
	"context"
	"encoding/json"
	"os/exec"
	"strings"
	"time"

	"moondust/internal/store"
)

const authStatusTimeout = 12 * time.Second

// claudeAuthStatusJSON matches `claude auth status --json` (camelCase).
type claudeAuthStatusJSON struct {
	LoggedIn         bool   `json:"loggedIn"`
	AuthMethod       string `json:"authMethod"`
	APIProvider      string `json:"apiProvider"`
	Email            string `json:"email"`
	OrgID            string `json:"orgId"`
	OrgName          string `json:"orgName"`
	SubscriptionType string `json:"subscriptionType"`
}

// AuthStatus runs `claude auth status --json` and maps it to store types.
// On failure, errMsg is non-empty and *store.ClaudeAuthStatus may be nil.
func AuthStatus(ctx context.Context, claudePath string) (auth *store.ClaudeAuthStatus, errMsg string) {
	cctx, cancel := context.WithTimeout(ctx, authStatusTimeout)
	defer cancel()
	cmd := exec.CommandContext(cctx, claudePath, "auth", "status", "--json")
	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &out
	runErr := cmd.Run()
	raw := strings.TrimSpace(out.String())
	// Some Claude Code builds exit non-zero when logged out but still print valid JSON.
	if raw != "" {
		if st, err := parseClaudeAuthStatusJSON([]byte(raw)); err == nil {
			return st, ""
		}
	}
	if runErr != nil {
		if raw != "" {
			return nil, raw
		}
		return nil, runErr.Error()
	}
	if raw == "" {
		return nil, "empty output from claude auth status"
	}
	_, err := parseClaudeAuthStatusJSON([]byte(raw))
	return nil, err.Error()
}

func parseClaudeAuthStatusJSON(raw []byte) (*store.ClaudeAuthStatus, error) {
	var parsed claudeAuthStatusJSON
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return nil, err
	}
	return &store.ClaudeAuthStatus{
		LoggedIn:         parsed.LoggedIn,
		AuthMethod:       parsed.AuthMethod,
		APIProvider:      parsed.APIProvider,
		Email:            parsed.Email,
		OrgID:            parsed.OrgID,
		OrgName:          parsed.OrgName,
		SubscriptionType: parsed.SubscriptionType,
	}, nil
}
