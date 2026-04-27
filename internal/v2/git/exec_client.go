package git

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"

	"moondust/internal/v1/oschild"

	gogit "github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing/transport"
	gitssh "github.com/go-git/go-git/v5/plumbing/transport/ssh"
)

type execClient struct{}

func (execClient) Clone(ctx context.Context, opts CloneOptions) error {
	auth, err := authMethodForURL(opts.URL, opts.Auth)
	if err != nil {
		return err
	}
	if _, err := gogit.PlainCloneContext(ctx, opts.TargetDir, false, &gogit.CloneOptions{
		URL:  opts.URL,
		Auth: auth,
	}); err != nil {
		_ = os.RemoveAll(opts.TargetDir)
		return fmt.Errorf("git clone: %w", err)
	}
	configureClonedRepo(ctx, opts.TargetDir)
	return nil
}

func (execClient) DefaultBranch(ctx context.Context, repoDir string) string {
	out, err := runGit(ctx, repoDir, "rev-parse", "--abbrev-ref", "HEAD")
	if err == nil {
		if b := strings.TrimSpace(out); b != "" && b != "HEAD" {
			return b
		}
	}
	sym, err := runGit(ctx, repoDir, "symbolic-ref", "refs/remotes/origin/HEAD")
	if err == nil {
		s := strings.TrimSpace(sym)
		const pfx = "refs/remotes/origin/"
		if strings.HasPrefix(s, pfx) {
			return strings.TrimPrefix(s, pfx)
		}
	}
	return "main"
}

func configureClonedRepo(ctx context.Context, repoDir string) {
	if runtime.GOOS != "windows" {
		return
	}
	if _, err := runGit(ctx, repoDir, "config", "core.fileMode", "false"); err != nil {
		slog.WarnContext(ctx, "failed to set core.fileMode", "error", err)
	}
	if _, err := runGit(ctx, repoDir, "config", "core.autocrlf", "true"); err != nil {
		slog.WarnContext(ctx, "failed to set core.autocrlf", "error", err)
	}
}

func runGit(ctx context.Context, dir string, args ...string) (string, error) {
	cmd := exec.CommandContext(ctx, "git", append([]string{"-C", dir}, args...)...)
	oschild.HideConsole(cmd)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("git %s: %w: %s", strings.Join(args, " "), err, strings.TrimSpace(string(out)))
	}
	return string(out), nil
}

func authMethodForURL(remoteURL string, auth AuthConfig) (transport.AuthMethod, error) {
	if !isSSHURL(remoteURL) {
		return nil, nil
	}
	sock := strings.TrimSpace(auth.SSHAuthSocketOverride)
	if sock == "" {
		sock = os.Getenv("SSH_AUTH_SOCK")
	}
	if sock != "" {
		prev := os.Getenv("SSH_AUTH_SOCK")
		os.Setenv("SSH_AUTH_SOCK", sock)
		defer func() {
			if prev == "" {
				os.Unsetenv("SSH_AUTH_SOCK")
			} else {
				os.Setenv("SSH_AUTH_SOCK", prev)
			}
		}()
	}
	if am, err := gitssh.NewSSHAgentAuth("git"); err == nil {
		return am, nil
	}
	home, err := os.UserHomeDir()
	if err == nil {
		for _, name := range []string{"id_ed25519", "id_rsa", "id_ecdsa"} {
			keyPath := filepath.Join(home, ".ssh", name)
			if _, err := os.Stat(keyPath); err != nil {
				continue
			}
			if am, err := gitssh.NewPublicKeysFromFile("git", keyPath, ""); err == nil {
				return am, nil
			}
		}
	}
	return nil, fmt.Errorf("no SSH authentication available: set SSH_AUTH_SOCK or add a key to ~/.ssh/")
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
