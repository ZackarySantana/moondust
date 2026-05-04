package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log/slog"
	"moondust/internal/sashspa"
	"moondust/internal/v2/app"
	"moondust/internal/v2/git"
	sashapi "moondust/internal/v2/sashapi"
	"moondust/internal/v2/service"
	"moondust/internal/v2/store/bbolt"
	"moondust/internal/v2/store/policy"
	"moondust/sashbindings"
	"net/http"
	"os"

	"github.com/zackarysantana/sash"
)

//go:embed all:packages/studio/dist
var distRoot embed.FS

func main() {
	sub, err := fs.Sub(distRoot, "packages/studio/dist")
	if err != nil {
		panic(fmt.Errorf("open embedded UI: %w", err))
	}

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
	api := sashapi.New(workspaceApp, threadApp, settingsApp)

	opts := sash.Options{
		Title:      "Moondust",
		Width:      1024,
		Height:     768,
		DevURL:     os.Getenv("SASH_DEV_URL"),
		DevAPIAddr: sashbindings.DevListenAddr,
		DevAPIMount: func(mux *http.ServeMux) {
			slog.Info("mounted dev sash API", "listen", sashbindings.DevListenAddr)
			sashbindings.MountDevRoutes(mux, api)
		},
		Assets: sashspa.FileSystem(sub),
		MountAPI: func(mux *http.ServeMux) {
			sashbindings.MountEmbedded(mux, api)
		},
	}

	if err := sash.Run(opts); err != nil {
		slog.Error("sash run", "err", err)
	}
}
