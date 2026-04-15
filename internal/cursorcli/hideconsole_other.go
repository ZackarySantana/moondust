//go:build !windows

package cursorcli

import "os/exec"

func setHideConsole(cmd *exec.Cmd) {}
