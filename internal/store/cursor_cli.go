package store

// CursorUsageSnapshot is a subset of Cursor dashboard usage (Composer/auto vs API model buckets).
type CursorUsageSnapshot struct {
	AutoPercentUsed  *float64 `json:"auto_percent_used,omitempty"`
	APIPercentUsed   *float64 `json:"api_percent_used,omitempty"`
	TotalPercentUsed *float64 `json:"total_percent_used,omitempty"`
	DisplayMessage   string   `json:"display_message,omitempty"`
	// AutoUsageMessage and APIUsageMessage mirror the Cursor app strings for each bucket.
	AutoUsageMessage string `json:"auto_usage_message,omitempty"`
	APIUsageMessage  string `json:"api_usage_message,omitempty"`
}

// CursorCLIInfo is read-only output from the Cursor Agent CLI (`agent`) when available on PATH.
type CursorCLIInfo struct {
	Installed bool `json:"installed"`
	// BinaryPath is the resolved path from exec.LookPath when Installed is true.
	BinaryPath string `json:"binary_path"`
	// Version is stdout from `agent --version` (trimmed).
	Version string `json:"version"`
	// StatusOutput is combined output from `agent status` (includes stderr on failure).
	StatusOutput string `json:"status_output"`
	// AboutOutput is combined output from `agent about`.
	AboutOutput string `json:"about_output"`
	// Usage is filled from the Cursor dashboard API when a local session token is available (same buckets as /usage in the agent TUI).
	Usage *CursorUsageSnapshot `json:"usage,omitempty"`
	// UsageError is set when no session file was found or the usage request failed (non-fatal).
	UsageError string `json:"usage_error,omitempty"`
	// ProbeError is set when the binary was not found or a fatal probe error occurred.
	ProbeError string `json:"probe_error,omitempty"`
}
