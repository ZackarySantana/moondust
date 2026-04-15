package store

// ClaudeAuthStatus is derived from `claude auth status --json` when the CLI is installed.
type ClaudeAuthStatus struct {
	LoggedIn         bool   `json:"logged_in"`
	AuthMethod       string `json:"auth_method,omitempty"`
	APIProvider      string `json:"api_provider,omitempty"`
	Email            string `json:"email,omitempty"`
	OrgID            string `json:"org_id,omitempty"`
	OrgName          string `json:"org_name,omitempty"`
	SubscriptionType string `json:"subscription_type,omitempty"`
}

// ClaudeCLIInfo is read-only output from the Claude Code CLI (`claude`) when available on PATH.
type ClaudeCLIInfo struct {
	Installed bool `json:"installed"`
	// BinaryPath is the resolved path from exec.LookPath when Installed is true.
	BinaryPath string `json:"binary_path"`
	// Version is stdout from `claude --version` (trimmed).
	Version string `json:"version"`
	// Auth is filled from `claude auth status --json` when Installed is true (non-fatal if missing).
	Auth *ClaudeAuthStatus `json:"auth,omitempty"`
	// AuthError is set when the auth status subcommand failed (non-fatal).
	AuthError string `json:"auth_error,omitempty"`
	// ProbeError is set when the binary was not found or `claude --version` failed.
	ProbeError string `json:"probe_error,omitempty"`
}
