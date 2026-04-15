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
	if err := cmd.Run(); err != nil {
		s := strings.TrimSpace(out.String())
		if s == "" {
			return nil, err.Error()
		}
		return nil, s
	}
	raw := strings.TrimSpace(out.String())
	if raw == "" {
		return nil, "empty output from claude auth status"
	}
	st, err := parseClaudeAuthStatusJSON([]byte(raw))
	if err != nil {
		return nil, err.Error()
	}
	return st, ""
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
