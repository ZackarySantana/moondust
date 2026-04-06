package main

import (
	"context"
	"errors"
	"sync/atomic"

	"moondust/internal/git"
	"moondust/internal/project"
	"moondust/internal/store"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var errAppNotReady = errors.New("app: project service not initialized")

type cancelToken struct {
	cancel context.CancelFunc
}

type App struct {
	ctx       context.Context
	projects  *project.Service
	createOp  atomic.Pointer[cancelToken]
}

func NewApp() *App {
	return &App{}
}

// startup stores ctx because Wails runtime APIs (e.g. directory dialogs) require the
// lifecycle context; generated bindings do not pass it per call.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	st, err := store.Open()
	if err != nil {
		runtime.LogErrorf(ctx, "store open: %v", err)
		return
	}
	a.projects = project.NewService(st, git.NewCommandClient())
	if a.projects == nil {
		runtime.LogError(ctx, "project service: nil (store or git client)")
		_ = st.Close()
	}
}

// SelectProjectFolder uses the OS picker so paths match what the user actually selected
// and platform permission prompts run in the native flow.
func (a *App) SelectProjectFolder() (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select project folder",
	})
}

func (a *App) beginCreate() (context.Context, *cancelToken) {
	ctx, cancel := context.WithCancel(a.ctx)
	tok := &cancelToken{cancel: cancel}
	if prev := a.createOp.Swap(tok); prev != nil {
		prev.cancel()
	}
	return ctx, tok
}

func (a *App) endCreate(tok *cancelToken) {
	tok.cancel()
	a.createOp.CompareAndSwap(tok, nil)
}

// CancelCreateProject aborts an in-flight CreateProjectFromRemote / CreateProjectFromFolder (e.g. user cancelled in the UI).
func (a *App) CancelCreateProject() {
	if t := a.createOp.Load(); t != nil {
		t.cancel()
	}
}

func (a *App) CreateProjectFromRemote(name, remoteURL string) (*store.Project, error) {
	if a.projects == nil {
		return nil, errAppNotReady
	}
	ctx, tok := a.beginCreate()
	defer a.endCreate(tok)
	return a.projects.CreateProjectFromRemote(ctx, name, remoteURL)
}

func (a *App) CreateProjectFromFolder(name, directory string) (*store.Project, error) {
	if a.projects == nil {
		return nil, errAppNotReady
	}
	ctx, tok := a.beginCreate()
	defer a.endCreate(tok)
	return a.projects.CreateProjectFromFolder(ctx, name, directory)
}

func (a *App) ListProjects() ([]store.Project, error) {
	if a.projects == nil {
		return nil, errAppNotReady
	}
	return a.projects.ListProjects()
}
