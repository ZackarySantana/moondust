# Agent guidelines: backend (`internal/`)

**Purpose:** Keep Go services, storage, and the Wails app API coherent and testable.

**Scope:** Change files under `internal/` (and tests alongside them) unless the task explicitly requires touching `main.go`, Wails bindings generation, or the frontend. Prefer small, focused diffs; follow existing package layout (`internal/app`, `internal/service`, `internal/store`, etc.).

## Stack

- Go module at repo root; backend code lives in `internal/`.
- Exposed to the desktop UI through Wails (`internal/app`); do not assume HTTP handlers for the default desktop flow.

## Testing

Follow [`.cursor/skills/go-tests/SKILL.md`](../.cursor/skills/go-tests/SKILL.md): one root `TestX` per function under test, cases via `t.Run`, `require` for preconditions, `assert` for expectations, no testify suites.

For comment style on new or heavily edited exported APIs, see [`.cursor/skills/go-comments/SKILL.md`](../.cursor/skills/go-comments/SKILL.md).

## Commands

- `go test ./internal/...` or `go test ./...` from the repository root.
- Broader workflows: `make dev` (Wails + frontend) is defined in the root [`Makefile`](../Makefile).

## Don’t

- Don’t hand-edit generated Wails TS bindings under `frontend/wailsjs/` from backend work; regenerate via Wails when models/APIs change.
- Don’t pull unrelated refactors into feature fixes.

For full setup and repo layout, see [`packages/docs/docs/contributing.md`](../packages/docs/docs/contributing.md).
