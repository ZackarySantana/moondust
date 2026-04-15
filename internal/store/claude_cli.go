package store

// ClaudeCLIInfo is read-only output from the Claude Code CLI (`claude`) when available on PATH.
type ClaudeCLIInfo struct {
	Installed bool `json:"installed"`
	// BinaryPath is the resolved path from exec.LookPath when Installed is true.
	BinaryPath string `json:"binary_path"`
	// Version is stdout from `claude --version` (trimmed).
	Version string `json:"version"`
	// ProbeError is set when the binary was not found or `claude --version` failed.
	ProbeError string `json:"probe_error,omitempty"`
}
