//go:build !windows

package run

import "os/exec"

func hideConsole(cmd *exec.Cmd) {}
