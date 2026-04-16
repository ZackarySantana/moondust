package service

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/go-git/go-git/v5/plumbing/transport"
	gitssh "github.com/go-git/go-git/v5/plumbing/transport/ssh"
	"moondust/internal/oschild"
)

func runGit(ctx context.Context, dir string, args ...string) (string, error) {
	cmd := exec.CommandContext(ctx, "git", append([]string{"-C", dir}, args...)...)
	oschild.HideConsole(cmd)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("git %s: %w: %s", strings.Join(args, " "), err, strings.TrimSpace(string(out)))
	}
	return string(out), nil
}

// runGitWithEnv runs git with extra environment variables (e.g. GIT_EDITOR=true for non-interactive continue).
func runGitWithEnv(ctx context.Context, dir string, extraEnv []string, args ...string) (string, error) {
	cmd := exec.CommandContext(ctx, "git", append([]string{"-C", dir}, args...)...)
	cmd.Env = append(os.Environ(), extraEnv...)
	oschild.HideConsole(cmd)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("git %s: %w: %s", strings.Join(args, " "), err, strings.TrimSpace(string(out)))
	}
	return string(out), nil
}

// detectDefaultBranchAfterClone returns the checked-out branch name after `git clone`, or a best-effort fallback.
func detectDefaultBranchAfterClone(ctx context.Context, dir string) string {
	out, err := runGit(ctx, dir, "rev-parse", "--abbrev-ref", "HEAD")
	if err == nil {
		if b := strings.TrimSpace(out); b != "" && b != "HEAD" {
			return b
		}
	}
	sym, err := runGit(ctx, dir, "symbolic-ref", "refs/remotes/origin/HEAD")
	if err == nil {
		s := strings.TrimSpace(sym)
		const pfx = "refs/remotes/origin/"
		if strings.HasPrefix(s, pfx) {
			return strings.TrimPrefix(s, pfx)
		}
	}
	return "main"
}

func sshAuthForURL(remoteURL, sshAuthSock string) (transport.AuthMethod, error) {
	if !isSSHURL(remoteURL) {
		return nil, nil
	}
	// If an override is provided (from global settings), temporarily set
	// SSH_AUTH_SOCK so the SSH agent library connects to the right socket.
	if sshAuthSock != "" {
		prev := os.Getenv("SSH_AUTH_SOCK")
		os.Setenv("SSH_AUTH_SOCK", sshAuthSock)
		defer func() {
			if prev == "" {
				os.Unsetenv("SSH_AUTH_SOCK")
			} else {
				os.Setenv("SSH_AUTH_SOCK", prev)
			}
		}()
	}
	if auth, err := gitssh.NewSSHAgentAuth("git"); err == nil {
		return auth, nil
	}
	home, err := os.UserHomeDir()
	if err == nil {
		for _, name := range []string{"id_ed25519", "id_rsa", "id_ecdsa"} {
			keyPath := filepath.Join(home, ".ssh", name)
			if _, err := os.Stat(keyPath); err != nil {
				continue
			}
			if auth, err := gitssh.NewPublicKeysFromFile("git", keyPath, ""); err == nil {
				return auth, nil
			}
		}
	}
	return nil, fmt.Errorf("no SSH authentication available: set SSH_AUTH_SOCK (e.g. 1Password SSH agent) or add a key to ~/.ssh/")
}

func isSSHURL(u string) bool {
	if strings.HasPrefix(u, "ssh://") {
		return true
	}
	if strings.Contains(u, "@") && strings.Contains(u, ":") && !strings.Contains(u, "://") {
		return true
	}
	return false
}

func configureClonedRepo(ctx context.Context, dir string) {
	if runtime.GOOS != "windows" {
		return
	}
	if _, err := runGit(ctx, dir, "config", "core.fileMode", "false"); err != nil {
		slog.WarnContext(ctx, "failed to set core.fileMode", "error", err)
	}
	if _, err := runGit(ctx, dir, "config", "core.autocrlf", "true"); err != nil {
		slog.WarnContext(ctx, "failed to set core.autocrlf", "error", err)
	}
}

