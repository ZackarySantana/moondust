package app

import (
	"moondust/internal/v1/browseropen"
	"moondust/internal/v1/openrouter"
	"moondust/internal/v1/store"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) GetSettings() (*store.Settings, error) {
	return a.service.GetSettings(a.Ctx)
}

func (a *App) SaveSettings(settings *store.Settings) error {
	return a.service.SaveSettings(a.Ctx, settings)
}

// ListOpenRouterChatModels returns chat models that support tools (from OpenRouter public API).
func (a *App) ListOpenRouterChatModels() ([]store.OpenRouterChatModel, error) {
	return a.service.ListOpenRouterChatModels(a.Ctx)
}

// ListCursorChatModels returns models from `agent --list-models` when the Cursor CLI is installed.
func (a *App) ListCursorChatModels() ([]store.OpenRouterChatModel, error) {
	return a.service.ListCursorChatModels(a.Ctx)
}

// GetOpenRouterUsageMetrics returns per-model usage and cost from stored assistant messages.
func (a *App) GetOpenRouterUsageMetrics() (*store.OpenRouterUsageMetrics, error) {
	return a.service.GetOpenRouterUsageMetrics(a.Ctx)
}

// GetCursorCLIInfo detects the Cursor Agent CLI (`agent`) and runs status/about probes.
func (a *App) GetCursorCLIInfo() (*store.CursorCLIInfo, error) {
	return a.service.GetCursorCLIInfo(a.Ctx)
}

// ListClaudeChatModels returns Claude Code model aliases for the thread picker.
func (a *App) ListClaudeChatModels() ([]store.OpenRouterChatModel, error) {
	return a.service.ListClaudeChatModels(a.Ctx)
}

// GetClaudeCLIInfo detects the Claude Code CLI (`claude`) on PATH.
func (a *App) GetClaudeCLIInfo() (*store.ClaudeCLIInfo, error) {
	return a.service.GetClaudeCLIInfo(a.Ctx)
}

// ConnectOpenRouterOAuth starts the OpenRouter OAuth (PKCE) flow in the system browser.
// Listen for the "openrouter:oauth" event: { status: "ok" } or { error: "..." }.
func (a *App) ConnectOpenRouterOAuth() {
	ctx := a.Ctx
	go func() {
		key, err := openrouter.BrowserOAuthFlow(ctx, func(authURL string) error {
			return browseropen.Open(authURL)
		})
		if err != nil {
			runtime.EventsEmit(ctx, "openrouter:oauth", map[string]string{"error": err.Error()})
			return
		}
		if err := a.service.SetOpenRouterAPIKey(ctx, key); err != nil {
			runtime.EventsEmit(ctx, "openrouter:oauth", map[string]string{"error": err.Error()})
			return
		}
		runtime.EventsEmit(ctx, "openrouter:oauth", map[string]string{"status": "ok"})
	}()
}

// ClearOpenRouterAPIKey removes the stored OpenRouter API key.
func (a *App) ClearOpenRouterAPIKey() error {
	return a.service.ClearOpenRouterAPIKey(a.Ctx)
}
