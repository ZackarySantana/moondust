//go:build !windows

package service

import "os/exec"

func hideConsoleWindow(_ *exec.Cmd) {}
