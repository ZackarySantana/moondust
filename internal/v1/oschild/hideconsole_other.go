//go:build !windows

package oschild

import "os/exec"

func HideConsole(cmd *exec.Cmd) {}
