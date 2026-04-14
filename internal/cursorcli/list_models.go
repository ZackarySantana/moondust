package cursorcli

import (
	"context"
	"fmt"
	"moondust/internal/store"
	"os/exec"
	"regexp"
	"strings"
	"time"
)

const listModelsTimeout = 60 * time.Second

var modelLineRE = regexp.MustCompile(`^\s*(\S+)\s+-\s+(.+?)\s*$`)

// ListChatModels runs `agent --list-models` and parses the model list (id — label).
func ListChatModels(ctx context.Context) ([]store.OpenRouterChatModel, error) {
	path, err := lookAgent()
	if err != nil {
		return nil, fmt.Errorf("cursor agent CLI not found on PATH: %w", err)
	}
	cctx, cancel := context.WithTimeout(ctx, listModelsTimeout)
	defer cancel()
	cmd := exec.CommandContext(cctx, path, "--list-models")
	out, err := cmd.CombinedOutput()
	text := StripANSI(string(out))
	if err != nil {
		return nil, fmt.Errorf("agent --list-models: %w\n%s", err, strings.TrimSpace(text))
	}

	var models []store.OpenRouterChatModel
	seen := map[string]struct{}{}
	for _, line := range strings.Split(text, "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.EqualFold(line, "Available models") || strings.EqualFold(line, "Loading models…") {
			continue
		}
		m := modelLineRE.FindStringSubmatch(line)
		if len(m) != 3 {
			continue
		}
		id := strings.TrimSpace(m[1])
		name := strings.TrimSpace(m[2])
		if id == "" || name == "" {
			continue
		}
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		models = append(models, store.OpenRouterChatModel{
			ID:          id,
			Name:        name,
			Provider:    "cursor",
			Description: name,
		})
	}
	if len(models) == 0 {
		return nil, fmt.Errorf("could not parse models from agent --list-models")
	}
	return models, nil
}
