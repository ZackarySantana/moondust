//go:build !darwin

package wails

import (
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

func wailsMacOptions() *mac.Options {
	return nil
}

func wailsApplicationMenu() *menu.Menu {
	return nil
}
