//go:build windows

package git

import (
	"os/exec"
	"syscall"
)

func hideExecWindow(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
}
