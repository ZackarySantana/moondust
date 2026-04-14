package app

import (
	"fmt"
	"moondust/internal/store"
	"os"
	"strings"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) ListLogs() ([]store.LogLine, error) {
	if a.stream == nil {
		return nil, nil
	}
	return a.stream.ListLogs(a.Ctx)
}

func (a *App) ClearLogs() error {
	if a.stream == nil {
		return nil
	}
	return a.stream.ClearLogs(a.Ctx)
}

func (a *App) DownloadLogs() error {
	if a.stream == nil {
		return nil
	}
	path, err := runtime.SaveFileDialog(a.Ctx, runtime.SaveDialogOptions{
		Title:           "Save logs",
		DefaultFilename: "moondust-logs.txt",
	})
	if err != nil {
		return err
	}
	if path == "" {
		return nil
	}
	lines, err := a.stream.ListLogs(a.Ctx)
	if err != nil {
		return err
	}
	var b strings.Builder
	for _, line := range lines {
		b.WriteString(formatLogLine(line))
		b.WriteByte('\n')
	}
	return os.WriteFile(path, []byte(b.String()), 0o644)
}

func (a *App) TerminalWebSocketURL() (string, error) {
	if a.term == nil {
		return "", fmt.Errorf("terminal server unavailable")
	}
	return a.term.URL(), nil
}

func formatLogLine(line store.LogLine) string {
	t := line.Time.Format(time.RFC3339)
	base := fmt.Sprintf("%s %s %s", t, line.Level, line.Message)
	if line.Extra != "" {
		return base + " " + line.Extra
	}
	return base
}
