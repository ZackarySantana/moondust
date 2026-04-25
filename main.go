package main

import (
	"context"
	"embed"
	"fmt"
	"log/slog"
	"moondust/internal/v1/app"
	"moondust/internal/v1/logstream"
	"moondust/internal/v1/notify"
	"moondust/internal/v1/service"
	"moondust/internal/v1/store/bbolt"
	"moondust/internal/v1/terminal"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	bolt "go.etcd.io/bbolt"
)

//go:embed all:packages/studio/dist
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

	settingsStore := bbolt.NewSettings(db)

	service := service.New(
		bbolt.NewProject(db),
		bbolt.NewThread(db),
		bbolt.NewMessage(db),
		settingsStore,
	)

	dispatcher := notify.NewDispatcher(settingsStore)

	logStream := logstream.New(bbolt.NewLog(db))
	logStream.Install()

	termSrv, err := terminal.New()
	if err != nil {
		panic(err)
	}

	app := app.New(service, dispatcher, logStream, termSrv)

	err = wails.Run(&options.App{
		Title:  "Moondust",
		Width:  1024,
		Height: 768,
		Mac:    wailsMacOptions(),
		Menu:   wailsApplicationMenu(),
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			slog.InfoContext(ctx, "startup started...")
			app.Ctx = ctx
			dispatcher.Setup(ctx)
			runtime.OnNotificationResponse(ctx, func(result runtime.NotificationResult) {
				if result.Error != nil || result.Response.UserInfo == nil {
					return
				}
				raw, ok := result.Response.UserInfo["path"]
				if !ok {
					return
				}
				path, ok := raw.(string)
				if !ok || path == "" || path[0] != '/' {
					return
				}
				runtime.EventsEmit(ctx, "notification:navigate", path)
			})
			slog.InfoContext(ctx, "startup completed...")
		},
		OnShutdown: func(ctx context.Context) {
			slog.InfoContext(ctx, "shutdown started...")
			dispatcher.Shutdown(ctx)
			logStream.Shutdown()
			if err := termSrv.Shutdown(ctx); err != nil {
				slog.ErrorContext(ctx, "terminal server shutdown", "error", err)
			}
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
