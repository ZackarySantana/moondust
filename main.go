package main

import (
	"context"
	"embed"
	"fmt"
	"log/slog"
	"moondust/internal/app"
	"moondust/internal/logstream"
	"moondust/internal/notify"
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

	projectStore := bbolt.NewProject(db)
	service := service.New(projectStore)

	notify := notify.Chain(notify.NewPushChannel())

	logStream := logstream.New()
	logStream.Install()

	app := app.New(service, notify, logStream)

	err = wails.Run(&options.App{
		Title:  "Moondust",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			slog.InfoContext(ctx, "startup started...")
			app.Ctx = ctx
			notify.Setup(ctx)
			slog.InfoContext(ctx, "startup completed...")
		},
		OnShutdown: func(ctx context.Context) {
			slog.InfoContext(ctx, "shutdown started...")
			notify.Shutdown(ctx)
			logStream.Shutdown()
			slog.InfoContext(ctx, "shutdown completed...")
		},
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
