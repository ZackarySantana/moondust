package main

import (
	"embed"
	"moondust/cmd/wails"
)

//go:embed all:packages/studio/dist
var assets embed.FS

// Wails v2 does not support a different main.go location.
func main() {
	wails.Main(assets)
}
