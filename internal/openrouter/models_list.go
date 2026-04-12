package openrouter

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"time"

	"moondust/internal/store"
)

const modelsListURL = "https://openrouter.ai/api/v1/models"

const maxChatModelsListed = 72

type apiModelsResponse struct {
	Data []apiModel `json:"data"`
}

type apiModel struct {
	ID                  string   `json:"id"`
	Name                string   `json:"name"`
	Created             int64    `json:"created"`
	SupportedParameters []string `json:"supported_parameters"`
	Architecture        struct {
		InputModalities  []string `json:"input_modalities"`
		OutputModalities []string `json:"output_modalities"`
	} `json:"architecture"`
}

// ListChatModels fetches the public OpenRouter model list and returns entries suitable for chat
// (text in/out, tool calling). Results are sorted newest-first and capped.
func ListChatModels(ctx context.Context) ([]store.OpenRouterChatModel, error) {
	ctx, cancel := context.WithTimeout(ctx, 45*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, modelsListURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "Moondust/1.0")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("fetch models: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("fetch models: HTTP %s", resp.Status)
	}

	var payload apiModelsResponse
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("decode models: %w", err)
	}

	out := filterChatModels(payload.Data)
	sort.SliceStable(out, func(i, j int) bool { return out[i].Created > out[j].Created })

	trimmed := make([]store.OpenRouterChatModel, 0, min(len(out), maxChatModelsListed))
	for i := range out {
		if i >= maxChatModelsListed {
			break
		}
		name := strings.TrimSpace(out[i].Name)
		if name == "" {
			name = out[i].ID
		}
		trimmed = append(trimmed, store.OpenRouterChatModel{
			ID:   out[i].ID,
			Name: name,
		})
	}
	return trimmed, nil
}

type scoredModel struct {
	ID      string
	Name    string
	Created int64
}

func filterChatModels(in []apiModel) []scoredModel {
	var out []scoredModel
	for _, m := range in {
		if !hasString(m.SupportedParameters, "tools") {
			continue
		}
		if !hasString(m.Architecture.InputModalities, "text") {
			continue
		}
		if !hasString(m.Architecture.OutputModalities, "text") {
			continue
		}
		out = append(out, scoredModel{ID: m.ID, Name: m.Name, Created: m.Created})
	}
	return out
}

func hasString(slice []string, want string) bool {
	for _, s := range slice {
		if s == want {
			return true
		}
	}
	return false
}
