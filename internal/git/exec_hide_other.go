//go:build !windows

package git

import "os/exec"

func hideExecWindow(cmd *exec.Cmd) {}
