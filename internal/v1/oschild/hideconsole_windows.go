//go:build windows

package oschild

import (
	"os/exec"
	"syscall"
)

// HideConsole suppresses an extra console window for CLI subprocesses on Windows
// (CREATE_NO_WINDOW + HideWindow). No-op on other platforms. Do not use for the
// embedded interactive terminal (PTY).
func HideConsole(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{
		HideWindow:    true,
		CreationFlags: 0x08000000, // CREATE_NO_WINDOW
	}
}
