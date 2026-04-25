package main

import (
	"context"
	"fmt"
	"log/slog"
	frontenddist "moondust"
	"moondust/internal/v2/app"
	"moondust/internal/v2/store/bbolt"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

func main() {
	db, err := bbolt.Connect()
	if err != nil {
		panic(fmt.Errorf("connect to database: %w", err))
	}

	stores, err := bbolt.New(db)
	if err != nil {
		panic(fmt.Errorf("create stores: %w", err))
	}

	err = wails.Run(&options.App{
		Title:  "Moondust",
		Width:  1024,
		Height: 768,
		Mac:    wailsMacOptions(),
		Menu:   wailsApplicationMenu(),
		AssetServer: &assetserver.Options{
			Assets: frontenddist.Assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			slog.InfoContext(ctx, "startup started...")
			slog.InfoContext(ctx, "startup completed...")
		},
		OnShutdown: func(ctx context.Context) {
			slog.InfoContext(ctx, "shutdown started...")
			slog.InfoContext(ctx, "shutdown completed...")
		},
		Bind: []interface{}{
			app.NewProject(stores),
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

// func main() {
// 	db, err := bbolt.Connect()
// 	if err != nil {
// 		panic(err)
// 	}

// 	settingsStore := bbolt.NewSettings(db)

// 	service := service.New(
// 		bbolt.NewProject(db),
// 		bbolt.NewThread(db),
// 		bbolt.NewMessage(db),
// 		settingsStore,
// 	)

// 	dispatcher := notify.NewDispatcher(settingsStore)

// 	logStream := logstream.New(bbolt.NewLog(db))
// 	logStream.Install()

// 	termSrv, err := terminal.New()
// 	if err != nil {
// 		panic(err)
// 	}

// 	app := app.New(service, dispatcher, logStream, termSrv)

// 	err = wails.Run(&options.App{
// 		Title:  "Moondust",
// 		Width:  1024,
// 		Height: 768,
// 		Mac:    wailsMacOptions(),
// 		Menu:   wailsApplicationMenu(),
// 		AssetServer: &assetserver.Options{
// 			Assets: frontenddist.Assets,
// 		},
// 		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
// 		OnStartup: func(ctx context.Context) {
// 			slog.InfoContext(ctx, "startup started...")
// 			app.Ctx = ctx
// 			dispatcher.Setup(ctx)
// 			runtime.OnNotificationResponse(ctx, func(result runtime.NotificationResult) {
// 				if result.Error != nil || result.Response.UserInfo == nil {
// 					return
// 				}
// 				raw, ok := result.Response.UserInfo["path"]
// 				if !ok {
// 					return
// 				}
// 				path, ok := raw.(string)
// 				if !ok || path == "" || path[0] != '/' {
// 					return
// 				}
// 				runtime.EventsEmit(ctx, "notification:navigate", path)
// 			})
// 			slog.InfoContext(ctx, "startup completed...")
// 		},
// 		OnShutdown: func(ctx context.Context) {
// 			slog.InfoContext(ctx, "shutdown started...")
// 			dispatcher.Shutdown(ctx)
// 			logStream.Shutdown()
// 			if err := termSrv.Shutdown(ctx); err != nil {
// 				slog.ErrorContext(ctx, "terminal server shutdown", "error", err)
// 			}
// 			slog.InfoContext(ctx, "shutdown completed...")
// 		},
// 		Bind: []interface{}{
// 			app,
// 		},
// 	})

// 	if err != nil {
// 		println("Error:", err.Error())
// 	}
// }
