package service

import (
	"context"
	"moondust/internal/claudecli"
	"moondust/internal/store"
)

// GetClaudeCLIInfo detects the Claude Code CLI (`claude`) on PATH.
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
		return info, nil
	}
	info.Installed = true
	return info, nil
}
