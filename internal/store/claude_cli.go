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

// ClaudeLocalUsage aggregates tokens from Claude Code local JSONL transcripts (~/.claude/projects, etc.).
// Percent fields split TotalTokens into input / output / cache (cache read + write) for sidebar bars.
type ClaudeLocalUsage struct {
	WindowDays int `json:"window_days"`
	// FilesScanned is the number of recently modified *.jsonl files read.
	FilesScanned int `json:"files_scanned"`
	// LinesMatched is assistant transcript lines that included usage.
	LinesMatched     int64 `json:"lines_matched"`
	TotalTokens      int64 `json:"total_tokens"`
	InputTokens      int64 `json:"input_tokens"`
	OutputTokens     int64 `json:"output_tokens"`
	CacheReadTokens  int64 `json:"cache_read_tokens"`
	CacheWriteTokens int64 `json:"cache_write_tokens"`
	// InputPercentUsed, OutputPercentUsed, CachePercentUsed are 0–100 when TotalTokens > 0.
	InputPercentUsed  *float64 `json:"input_percent_used,omitempty"`
	OutputPercentUsed *float64 `json:"output_percent_used,omitempty"`
	CachePercentUsed  *float64 `json:"cache_percent_used,omitempty"`
	// ScanError is set when a file could not be fully read (non-fatal; totals may be partial).
	ScanError string `json:"scan_error,omitempty"`
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
	// LocalUsage sums JSONL transcript usage for files touched within WindowDays (best-effort).
	LocalUsage *ClaudeLocalUsage `json:"local_usage,omitempty"`
	// LocalUsageError is set when the local scan failed entirely.
	LocalUsageError string `json:"local_usage_error,omitempty"`
}
