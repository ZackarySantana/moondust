package policy

import "moondust/internal/v2/store"

func Wrap(stores *store.Stores) *store.Stores {
	return &store.Stores{
		Project:   WrapProject(stores.Project),
		Thread:    WrapThread(stores.Thread),
		ChatEvent: WrapChatEvent(stores.ChatEvent),
		Settings: struct {
			Global     store.GlobalSettingsStore
			OpenRouter store.OpenRouterSettingsStore
			Cursor     store.CursorSettingsStore
			Claude     store.ClaudeSettingsStore
		}{
			Global:     WrapGlobalSettings(stores.Settings.Global),
			OpenRouter: WrapOpenRouterSettings(stores.Settings.OpenRouter),
			Cursor:     WrapCursorSettings(stores.Settings.Cursor),
			Claude:     WrapClaudeSettings(stores.Settings.Claude),
		},
		Log: WrapLog(stores.Log),
	}
}
