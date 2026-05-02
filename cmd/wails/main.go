package wails

import (
	"context"
	"embed"
	"fmt"
	"log/slog"
	"moondust/internal/v2/app"
	"moondust/internal/v2/git"
	"moondust/internal/v2/service"
	"moondust/internal/v2/store/bbolt"
	"moondust/internal/v2/store/policy"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

func Main(assets embed.FS) {
	db, err := bbolt.Connect()
	if err != nil {
		panic(fmt.Errorf("connect to database: %w", err))
	}

	stores := policy.Wrap(bbolt.New(db))
	if err := stores.Validate(); err != nil {
		panic(fmt.Errorf("validate stores: %w", err))
	}

	gitClient := git.NewClient()

	workspaceApp := app.NewWorkspace(service.NewWorkspace(stores, gitClient))
	threadApp := app.NewThread(service.NewThread(stores))
	settingsApp := app.NewSettings(service.NewGlobalSettingsService(stores))

	err = wails.Run(&options.App{
		Title:  "Moondust",
		Width:  1024,
		Height: 768,
		Mac:    wailsMacOptions(),
		Menu:   wailsApplicationMenu(),
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 5, G: 6, B: 16, A: 1},
		OnStartup: func(ctx context.Context) {
			slog.InfoContext(ctx, "startup started...")
			defer slog.InfoContext(ctx, "startup completed...")
			workspaceApp.SetContext(ctx)
			threadApp.SetContext(ctx)
			settingsApp.SetContext(ctx)
		},
		OnShutdown: func(ctx context.Context) {
			slog.InfoContext(ctx, "shutdown started...")
			defer slog.InfoContext(ctx, "shutdown completed...")
		},
		Bind: []interface{}{
			workspaceApp,
			threadApp,
			settingsApp,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
