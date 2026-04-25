package main

import (
	"embed"
	"moondust/cmd/wails"
)

//go:embed all:packages/studio/dist
var assets embed.FS

func main() {
	wails.Main(assets)
}
