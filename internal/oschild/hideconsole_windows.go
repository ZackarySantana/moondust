//go:build windows

package oschild

import (
	"os/exec"
	"syscall"
)

// HideConsole avoids a flashing console window when Moondust runs a CLI subprocess
// from the Wails GUI on Windows.
func HideConsole(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{
		HideWindow:    true,
		CreationFlags: 0x08000000, // CREATE_NO_WINDOW
	}
}
