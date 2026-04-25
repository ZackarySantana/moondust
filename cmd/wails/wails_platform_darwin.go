//go:build darwin

package main

import (
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

// wailsMacOptions configures native window behavior on macOS.
//
// Wails' Darwin backend only sets the "zoomable" flag when options.Mac is non-nil.
// If zoomable is false while the window is resizable, it disables the green
// traffic-light button (NSWindowZoomButton). See wails WailsContext.m CreateWindow.
func wailsMacOptions() *mac.Options {
	return &mac.Options{
		DisableZoom: false,
		Preferences: &mac.Preferences{
			// Allow HTML5 element fullscreen (e.g. media) inside WKWebView.
			FullscreenEnabled: mac.Enabled,
		},
	}
}

// wailsApplicationMenu returns the standard macOS menu bar (App, Edit, Window).
// This wires system behaviors such as ⌃⌘F (Enter Full Screen) and ⌘M (Minimize)
// that expect a Window menu; see wails issue #2582.
func wailsApplicationMenu() *menu.Menu {
	return menu.NewMenuFromItems(
		menu.AppMenu(),
		menu.EditMenu(),
		menu.WindowMenu(),
	)
}
