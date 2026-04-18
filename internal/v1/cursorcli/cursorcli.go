package cursorcli

import (
	"context"
	"fmt"
	"moondust/internal/v1/oschild"
	"moondust/internal/v1/store"
	"os/exec"
	"regexp"
	"runtime"
	"strings"
	"time"
)

const probeTimeout = 8 * time.Second

// CSI (SGR, cursor motion, erase) and OSC (hyperlinks, title) sequences from a TUI
// must not reach the web UI as raw bytes.
var (
	ansiCSI = regexp.MustCompile(`\x1b\[[\x30-\x3f]*[\x20-\x2f]*[\x40-\x7e]`)
	ansiOSC = regexp.MustCompile(`\x1b\][^\x07]*(?:\x07|\x1b\\)`)
)

// StripANSI removes ANSI CSI/OSC sequences and normalizes newlines (for parsing agent TTY output).
func StripANSI(s string) string {
	s = ansiCSI.ReplaceAllString(s, "")
	s = ansiOSC.ReplaceAllString(s, "")
	s = strings.ReplaceAll(s, "\r\n", "\n")
	s = strings.ReplaceAll(s, "\r", "\n")
	return s
}

// LookAgent returns the resolved path to the `agent` binary, or an error if not on PATH.
func LookAgent() (string, error) {
	return lookAgent()
}

// Probe locates `agent` on PATH and runs `agent --version`, `agent status`, and `agent about`.
// When the binary is missing, returns Installed=false and no error.

func Probe(ctx context.Context) (*store.CursorCLIInfo, error) {
	path, err := lookAgent()
	if err != nil {
		info := &store.CursorCLIInfo{
			Installed:  false,
			ProbeError: "Cursor Agent CLI (`agent`) not found on PATH. Install from cursor.com/install and restart your terminal.",
		}
		probeFillUsage(ctx, info)
		return info, nil
	}

	info := &store.CursorCLIInfo{
		Installed:  true,
		BinaryPath: path,
	}

	run := func(args ...string) string {
		cctx, cancel := context.WithTimeout(ctx, probeTimeout)
		defer cancel()
		cmd := exec.CommandContext(cctx, path, args...)
		oschild.HideConsole(cmd)
		out, err := cmd.CombinedOutput()
		s := StripANSI(strings.TrimSpace(string(out)))
		if err != nil {
			if cctx.Err() == context.DeadlineExceeded {
				return s + "\n(error: timed out)"
			}
			if s != "" {
				return s + "\n(error: " + err.Error() + ")"
			}
			return "error: " + err.Error()
		}
		return s
	}

	info.Version = run("--version")
	info.StatusOutput = run("status")
	info.AboutOutput = run("about")

	probeFillUsage(ctx, info)
	return info, nil
}

func probeFillUsage(ctx context.Context, info *store.CursorCLIInfo) {
	tok, err := readCursorAccessToken()
	if err != nil {
		info.UsageError = "No Cursor login session found. Sign in with the Cursor app or run `agent login`."
		return
	}
	u, err := fetchCurrentPeriodUsage(ctx, tok)
	if err != nil {
		info.UsageError = err.Error()
		return
	}
	info.Usage = u
}

func lookAgent() (string, error) {
	p, err := exec.LookPath("agent")
	if err == nil {
		return p, nil
	}
	if runtime.GOOS == "windows" {
		p, werr := exec.LookPath("agent.exe")
		if werr == nil {
			return p, nil
		}
	}
	return "", fmt.Errorf("agent not found: %w", err)
}
