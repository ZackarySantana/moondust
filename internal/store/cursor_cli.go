package store

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
	// ProbeError is set when the binary was not found or a fatal probe error occurred.
	ProbeError string `json:"probe_error,omitempty"`
}
