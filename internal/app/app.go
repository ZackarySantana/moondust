package app

import (
	"context"
	"crypto/rand"
	"fmt"
	"moondust/internal/logstream"
	"moondust/internal/notify"
	"moondust/internal/service"
	"moondust/internal/store"
	"moondust/internal/terminal"
	"os"
	"strings"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	Ctx context.Context

	service *service.Service
	notify  notify.Channel
	stream  *logstream.Stream
	term    *terminal.Server
}

func New(service *service.Service, notify notify.Channel, stream *logstream.Stream, term *terminal.Server) *App {
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

func (a *App) CreateProjectFromRemote(name, remoteURL string) (*store.Project, error) {
	p, err := a.service.CreateProjectFromRemote(a.Ctx, name, remoteURL)
	if err != nil {
		return nil, err
	}
	a.notifyProjectCreated(p)
	return p, nil
}

func (a *App) CreateProjectFromFolder(name, directory string) (*store.Project, error) {
	p, err := a.service.CreateProjectFromFolder(a.Ctx, name, directory)
	if err != nil {
		return nil, err
	}
	a.notifyProjectCreated(p)
	return p, nil
}

func (a *App) GetProject(id string) (*store.Project, error) {
	return a.service.GetProject(a.Ctx, id)
}

func (a *App) ListProjects() ([]*store.Project, error) {
	return a.service.ListProjects(a.Ctx)
}

func (a *App) UpdateProject(project *store.Project) error {
	return a.service.UpdateProject(a.Ctx, project)
}

func (a *App) DeleteProject(id string, deleteFiles bool) error {
	return a.service.DeleteProject(a.Ctx, id, deleteFiles)
}

func (a *App) CreateThread(projectID string) (*store.Thread, error) {
	return a.service.CreateThread(a.Ctx, projectID)
}

func (a *App) GetThread(id string) (*store.Thread, error) {
	return a.service.GetThread(a.Ctx, id)
}

func (a *App) ListThreads() ([]*store.Thread, error) {
	return a.service.ListThreads(a.Ctx)
}

func (a *App) ListThreadMessages(threadID string) ([]*store.ChatMessage, error) {
	return a.service.ListThreadMessages(a.Ctx, threadID)
}

func (a *App) SendThreadMessage(threadID, content string) ([]*store.ChatMessage, error) {
	return a.service.SendThreadMessage(a.Ctx, threadID, content)
}

func (a *App) GetThreadGitStatus(threadID string) (*store.GitStatus, error) {
	return a.service.GetThreadGitStatus(a.Ctx, threadID)
}

func (a *App) GetThreadGitReview(threadID string) (*store.GitReview, error) {
	return a.service.GetThreadGitReview(a.Ctx, threadID)
}

func (a *App) CancelCreateProject() {
}

func (a *App) SetLogStreaming(enabled bool) {
	if a.stream == nil {
		return
	}
	a.stream.SetEnabled(a.Ctx, enabled)
}

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

func (a *App) notifyProjectCreated(p *store.Project) error {
	return a.notify.Send(a.Ctx, notify.NewPushNotification(
		notify.LevelInfo,
		&runtime.NotificationOptions{
			ID:    rand.Text(),
			Title: "Project Created",
			Body:  fmt.Sprintf("Project %q is ready.", p.Name),
		},
	))
}
