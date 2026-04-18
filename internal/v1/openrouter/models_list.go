package openrouter

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"moondust/internal/v1/store"
)

const modelsListURL = "https://openrouter.ai/api/v1/models"

const maxChatModelsListed = 100

const longContextThreshold = 128_000

type apiModelsResponse struct {
	Data []apiModel `json:"data"`
}

type apiModel struct {
	ID                  string   `json:"id"`
	Name                string   `json:"name"`
	Description         string   `json:"description"`
	Created             int64    `json:"created"`
	ContextLength       int      `json:"context_length"`
	SupportedParameters []string `json:"supported_parameters"`
	Pricing             struct {
		Prompt     string `json:"prompt"`
		Completion string `json:"completion"`
	} `json:"pricing"`
	Architecture struct {
		InputModalities  []string `json:"input_modalities"`
		OutputModalities []string `json:"output_modalities"`
	} `json:"architecture"`
}

// ListChatModels fetches the public OpenRouter model list and returns entries suitable for chat
// (text in/out, tool calling). Results are sorted by provider, then name, and capped.
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

	filtered := filterChatModels(payload.Data)
	sort.SliceStable(filtered, func(i, j int) bool {
		pi, pj := providerSlug(filtered[i].ID), providerSlug(filtered[j].ID)
		if pi != pj {
			return pi < pj
		}
		return strings.ToLower(strings.TrimSpace(filtered[i].Name)) < strings.ToLower(strings.TrimSpace(filtered[j].Name))
	})

	out := make([]store.OpenRouterChatModel, 0, min(len(filtered), maxChatModelsListed))
	for i := range filtered {
		if len(out) >= maxChatModelsListed {
			break
		}
		out = append(out, toStoreModel(filtered[i]))
	}
	return out, nil
}

func providerSlug(id string) string {
	id = strings.TrimSpace(id)
	i := strings.Index(id, "/")
	if i <= 0 {
		return "other"
	}
	return id[:i]
}

const maxDescriptionFullRunes = 8000

func toStoreModel(m apiModel) store.OpenRouterChatModel {
	name := strings.TrimSpace(m.Name)
	if name == "" {
		name = m.ID
	}
	raw := strings.TrimSpace(m.Description)
	full := raw
	if full == "" {
		full = "TBA"
	} else {
		full = truncateRunes(full, maxDescriptionFullRunes)
	}
	preview := full
	if preview != "TBA" {
		preview = truncateRunes(firstLine(preview), 160)
	}
	pp := strings.TrimSpace(m.Pricing.Prompt)
	pc := strings.TrimSpace(m.Pricing.Completion)
	return store.OpenRouterChatModel{
		ID:                m.ID,
		Name:              name,
		Provider:          providerSlug(m.ID),
		Description:       preview,
		DescriptionFull:   full,
		PricingTier:       pricingTierDisplay(m),
		PricingPrompt:     pp,
		PricingCompletion: pc,
		PricingSummary:    pricingSummaryFromStrings(pp, pc),
		Vision:            visionCapable(m),
		Reasoning:         reasoningCapable(m),
		LongContext:       m.ContextLength >= longContextThreshold,
		ContextLength:     m.ContextLength,
	}
}

// pricingSummaryFromStrings formats OpenRouter per-token USD strings as $/1M tokens for the model card.
func pricingSummaryFromStrings(prompt, completion string) string {
	a := formatUSDPer1MFromTokenPrice(prompt)
	b := formatUSDPer1MFromTokenPrice(completion)
	if a == "—" && b == "—" {
		return "Free (no per-token charge listed)"
	}
	return fmt.Sprintf("Input %s · Output %s", a, b)
}

func formatUSDPer1MFromTokenPrice(s string) string {
	f := parsePriceString(s)
	if f <= 0 {
		return "—"
	}
	perM := f * 1e6
	if math.IsNaN(perM) || math.IsInf(perM, 0) || perM <= 0 {
		return "—"
	}
	switch {
	case perM < 0.0001:
		return fmt.Sprintf("$%.8g/1M", perM)
	case perM < 0.01:
		return fmt.Sprintf("$%.6g/1M", perM)
	default:
		return fmt.Sprintf("$%.4g/1M", perM)
	}
}

func firstLine(s string) string {
	s = strings.TrimSpace(s)
	if i := strings.IndexAny(s, "\r\n"); i >= 0 {
		return strings.TrimSpace(s[:i])
	}
	return s
}

func truncateRunes(s string, max int) string {
	if max <= 0 {
		return ""
	}
	if utf8.RuneCountInString(s) <= max {
		return s
	}
	r := []rune(s)
	if len(r) <= max {
		return s
	}
	return string(r[:max]) + "…"
}

func pricingTierDisplay(m apiModel) string {
	p := parsePriceString(m.Pricing.Prompt)
	c := parsePriceString(m.Pricing.Completion)
	sum := p + c
	if sum <= 0 {
		return "Free"
	}
	// Heuristic tiers from typical OpenRouter $/token strings (magnitudes vary by model class).
	switch {
	case sum < 0.00002:
		return "$"
	case sum < 0.0002:
		return "$$"
	case sum < 0.002:
		return "$$$"
	default:
		return "$$$$"
	}
}

func parsePriceString(s string) float64 {
	s = strings.TrimSpace(s)
	if s == "" || s == "0" {
		return 0
	}
	f, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0
	}
	return f
}

func visionCapable(m apiModel) bool {
	for _, x := range m.Architecture.InputModalities {
		if x == "image" || x == "video" {
			return true
		}
	}
	return false
}

func reasoningCapable(m apiModel) bool {
	for _, p := range m.SupportedParameters {
		if p == "reasoning" || p == "include_reasoning" {
			return true
		}
	}
	return false
}

func filterChatModels(in []apiModel) []apiModel {
	var out []apiModel
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
		out = append(out, m)
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
