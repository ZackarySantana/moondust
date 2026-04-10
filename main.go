package main

import (
	"embed"
	"fmt"
	"moondust/internal/app"
	"moondust/internal/service"
	"moondust/internal/store/bbolt"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	bolt "go.etcd.io/bbolt"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	cacheDir, err := os.UserCacheDir()
	if err != nil {
		panic(err)
	}

	dbPath := filepath.Join(cacheDir, "moondust", "data", "database.bolt")

	if err := os.MkdirAll(filepath.Dir(dbPath), 0o755); err != nil {
		panic(fmt.Errorf("mkdir database directory: %w", err))
	}

	db, err := bolt.Open(dbPath, 0600, nil)
	if err != nil {
		panic(err)
	}

	store := bbolt.NewProject(db)

	service := service.NewService(store)

	app := app.New(service)

	err = wails.Run(&options.App{
		Title:  "Moondust",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.Startup,
		OnShutdown:       app.Shutdown,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
