package cursor

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"moondust/src/v2/provider"
	"os/exec"
)

type StatusCommandOutput struct {
	Status          string `json:"status"`
	IsAuthenticated bool   `json:"isAuthenticated"`
	HasAccessToken  bool   `json:"hasAccessToken"`
	HasRefreshToken bool   `json:"hasRefreshToken"`
	Message         string `json:"message"`
}

func (p *Provider) LookUp(ctx context.Context) (*provider.Status, error) {
	status := &provider.Status{
		DownloadURL: downloadURL,
	}

	var err error
	status.BinaryPath, err = p.binaryPath(ctx)
	if err != nil {
		if errors.Is(err, exec.ErrNotFound) {
			return status, nil
		}
		return nil, fmt.Errorf("finding cursor: %w", err)
	}
	status.Installed = true

	version, err := p.opts.executor.QuickRun(ctx, status.BinaryPath, "--version")
	if err != nil {
		return nil, fmt.Errorf("getting cursor version: %w", err)
	}
	status.Version = string(version)

	statusOutput, err := p.opts.executor.QuickRun(ctx, status.BinaryPath, "status", "--format", "json")
	if err != nil {
		return nil, fmt.Errorf("getting cursor status: %w", err)
	}
	// TODO-v2: log out the full status
	var cursorStatus StatusCommandOutput
	if err := json.Unmarshal(statusOutput, &cursorStatus); err != nil {
		return nil, fmt.Errorf("unmarshalling cursor status: %w", err)
	}
	status.Authenticated = cursorStatus.IsAuthenticated

	return status, nil
}
