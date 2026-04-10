//go:build windows

package app

import (
	"log/slog"
	"os"
	"path/filepath"

	toast "git.sr.ht/~jackmordaunt/go-toast/v2"
	"golang.org/x/sys/windows/registry"
)

// Wails sets go-toast AppID to filepath.Base(exe) (e.g. "moondust.exe"), which is what
// Windows shows as the toast / Action Center sender. Re-apply SetAppData with a human
// label while keeping the same GUID and paths Wails already registered.
//
// See: wails internal/frontend/desktop/windows/notifications.go (InitializeNotifications).
const windowsToastAppLabel = "Moondust"

const (
	registryAppUserModelPrefix = `Software\Classes\AppUserModelId\`
	toastRegistryGuidKey       = "CustomActivator"
)

func applyWindowsToastDisplayName() {
	exe, err := os.Executable()
	if err != nil {
		slog.Debug("toast display name: executable path", "error", err)
		return
	}
	exeBase := filepath.Base(exe)
	keyPath := registryAppUserModelPrefix + exeBase
	k, err := registry.OpenKey(registry.CURRENT_USER, keyPath, registry.QUERY_VALUE)
	if err != nil {
		slog.Debug("toast display name: open registry", "error", err)
		return
	}
	guid, _, err := k.GetStringValue(toastRegistryGuidKey)
	_ = k.Close()
	if err != nil || guid == "" {
		slog.Debug("toast display name: read GUID", "error", err)
		return
	}
	iconPath := filepath.Join(os.TempDir(), exeBase+guid+".png")
	if err := toast.SetAppData(toast.AppData{
		AppID:         windowsToastAppLabel,
		GUID:          guid,
		IconPath:      iconPath,
		ActivationExe: exe,
	}); err != nil {
		slog.Debug("toast display name: SetAppData", "error", err)
	}
}
