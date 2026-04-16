---
sidebar_position: 3
---

# Architecture

Moondust is a **[Wails](https://wails.io/)** application: a **Go** backend exposes methods to a **SolidJS** frontend bundled with Vite. The UI calls into Go via generated bindings (`frontend/wailsjs/`).

## Data and IPC

- **Local persistence** uses embedded storage (see `internal/` and Bolt usage) for projects, threads, messages, and settings, not a hosted server in the default desktop flow.
- **TanStack Query** on the frontend caches server-ish reads (IPC calls) and invalidates when mutations or events complete.

## Chat streaming

Assistant replies are produced asynchronously in Go. The active **chat provider** (OpenRouter HTTP, Cursor CLI, or Claude CLI) is selected per **thread**; each path streams deltas back through shared plumbing.

Progress is pushed to the UI with **Wails runtime events** (`chat:stream_start`, `chat:stream`, `chat:stream_done`, `chat:stream_error`). The frontend subscribes once at the app shell so **thread** and **sidebar** state stay consistent when you navigate between routes during an active stream.

**Utility** LLM calls (commit message suggestion, branch review, quick question, Git conflict resolution) use a separate **utility provider/model** from settings and may call OpenRouter or delegate through the same provider abstractions as appropriate.

**Sidebar lanes** (e.g. quick question) can use additional event names so parallel streams do not clobber the main chat stream.

## Git and terminal

Git operations and file diffs run in the Go layer against the working tree / worktree for the active thread. Review and wizard flows may run `git fetch`, merge/rebase, and conflict resolution in-process.

The **terminal** is served over a WebSocket URL exposed by the app for the embedded terminal component.

This page is intentionally high level; read the code under `internal/app` and `frontend/src` for exact behavior.
