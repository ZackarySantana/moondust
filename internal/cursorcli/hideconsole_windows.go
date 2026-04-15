//go:build windows

package cursorcli

import (
	"os/exec"
	"syscall"
)

// setHideConsole avoids a flashing console window when Moondust runs the Cursor
// Agent CLI (`agent`) as a GUI subprocess on Windows.
func setHideConsole(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{
		HideWindow: true,
	}
}
