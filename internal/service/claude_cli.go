package service

import (
	"context"
	"os"
	"time"

	"moondust/internal/claudecli"
	"moondust/internal/store"
)

const claudeLocalUsageWindowDays = 7

// GetClaudeCLIInfo detects the Claude Code CLI (`claude`) on PATH and aggregates local JSONL usage.
func (s *Service) GetClaudeCLIInfo(ctx context.Context) (*store.ClaudeCLIInfo, error) {
	_ = s
	path, ver, errMsg := claudecli.Probe(ctx)
	info := &store.ClaudeCLIInfo{
		BinaryPath: path,
		Version:    ver,
	}
	if errMsg != "" {
		info.ProbeError = errMsg
	}
	if path == "" {
		info.Installed = false
	} else {
		info.Installed = true
		auth, authErr := claudecli.AuthStatus(ctx, path)
		if authErr != "" {
			info.AuthError = authErr
		} else {
			info.Auth = auth
		}
	}

	if home, herr := os.UserHomeDir(); herr == nil && home != "" {
		cutoff := time.Now().Add(-time.Duration(claudeLocalUsageWindowDays) * 24 * time.Hour)
		lu, scanErr := claudecli.ScanLocalUsage(ctx, home, claudeLocalUsageWindowDays, cutoff)
		if scanErr != nil {
			info.LocalUsageError = scanErr.Error()
		} else {
			info.LocalUsage = lu
		}
	}

	return info, nil
}
