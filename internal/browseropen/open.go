// Package browseropen opens URLs in the system default browser with fallbacks.
// Wails' runtime.BrowserOpenURL uses github.com/pkg/browser, which often fails on
// WSL and minimal Linux installs (no working xdg-open).
package browseropen

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strings"

	"moondust/internal/oschild"
)

// Open tries several strategies so OAuth and other flows work on WSL, Linux, macOS, and Windows.
func Open(raw string) error {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return fmt.Errorf("empty URL")
	}

	switch runtime.GOOS {
	case "darwin":
		cmd := exec.Command("open", raw)
		oschild.HideConsole(cmd)
		return cmd.Start()
	case "windows":
		cmd := exec.Command("rundll32", "url.dll,FileProtocolHandler", raw)
		oschild.HideConsole(cmd)
		return cmd.Start()
	default:
		return openUnixLike(raw)
	}
}

func openUnixLike(url string) error {
	// WSL: prefer the Windows host browser — Linux GUI browser is often missing or broken.
	if isWSL() {
		for _, try := range []func(string) error{
			openViaWindowsCmd,
			openViaWslview,
			openViaPowerShell,
		} {
			if err := try(url); err == nil {
				return nil
			}
		}
	}

	candidates := [][]string{
		{"xdg-open", url},
		{"gio", "open", url},
		{"x-www-browser", url},
	}
	var lastErr error
	for _, c := range candidates {
		lp, err := exec.LookPath(c[0])
		if err != nil {
			continue
		}
		cmd := exec.Command(lp, c[1:]...)
		oschild.HideConsole(cmd)
		err = cmd.Start()
		if err == nil {
			return nil
		}
		lastErr = err
	}
	if lastErr != nil {
		return fmt.Errorf("open URL: %w", lastErr)
	}
	return fmt.Errorf("no xdg-open, gio, or x-www-browser found; install one or open the link manually")
}

func isWSL() bool {
	b, err := os.ReadFile("/proc/sys/kernel/osrelease")
	if err != nil {
		return false
	}
	s := strings.ToLower(string(b))
	return strings.Contains(s, "microsoft") || strings.Contains(s, "wsl")
}

func openViaWindowsCmd(url string) error {
	const cmdExe = "/mnt/c/Windows/System32/cmd.exe"
	if _, err := os.Stat(cmdExe); err != nil {
		return err
	}
	// cmd /c start "" <url> — empty arg is the window title required by `start` for URLs.
	cmd := exec.Command(cmdExe, "/c", "start", "", url)
	oschild.HideConsole(cmd)
	return cmd.Start()
}

func openViaWslview(url string) error {
	lp, err := exec.LookPath("wslview")
	if err != nil {
		return err
	}
	cmd := exec.Command(lp, url)
	oschild.HideConsole(cmd)
	return cmd.Start()
}

func openViaPowerShell(url string) error {
	const pwsh = "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"
	if _, err := os.Stat(pwsh); err != nil {
		return err
	}
	// Start-Process with a quoted URL works for OpenRouter's long query strings.
	cmd := exec.Command(pwsh, "-NoProfile", "-STA", "-Command",
		fmt.Sprintf("Start-Process %q", url))
	oschild.HideConsole(cmd)
	return cmd.Start()
}
