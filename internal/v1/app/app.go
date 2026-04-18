package app

import (
	"context"
	"moondust/internal/v1/buildinfo"
	"moondust/internal/v1/logstream"
	"moondust/internal/v1/notify"
	"moondust/internal/v1/service"
	"moondust/internal/v1/terminal"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	Ctx context.Context

	service *service.Service
	notify  *notify.Dispatcher
	stream  *logstream.Stream
	term    *terminal.Server
}

func New(service *service.Service, notify *notify.Dispatcher, stream *logstream.Stream, term *terminal.Server) *App {
	return &App{
		Ctx:     context.Background(),
		service: service,
		notify:  notify,
		stream:  stream,
		term:    term,
	}
}

// SelectProjectFolder uses the OS picker so paths match what the user actually selected
// and platform permission prompts run in the native flow.
func (a *App) SelectProjectFolder() (string, error) {
	return runtime.OpenDirectoryDialog(a.Ctx, runtime.OpenDialogOptions{
		Title: "Select Project Folder",
	})
}

// GetBuildLabel returns the user-visible version string (dev build vs release tag).
func (*App) GetBuildLabel() string {
	return buildinfo.DisplayLabel
}

// IsPushAvailable reports whether desktop push notifications are available on
// this platform. The frontend uses this to conditionally disable the push toggle.
func (a *App) IsPushAvailable() bool {
	return notify.PushAvailable()
}

func (a *App) CancelCreateProject() {
}

func (a *App) SetLogStreaming(enabled bool) {
	if a.stream == nil {
		return
	}
	a.stream.SetEnabled(a.Ctx, enabled)
}
