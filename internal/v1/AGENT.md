# Agent guidelines: backend (`internal/v1/`)

**Purpose:** Keep Go services, storage, and the Wails app API coherent and testable.

**Scope:** Change files under `internal/v1/` (and tests alongside them) unless the task explicitly requires touching `main.go`, Wails bindings generation, or the frontend. Prefer small, focused diffs; follow existing package layout (`internal/v1/app`, `internal/v1/service`, `internal/v1/store`, etc.). Add new major API work under `internal/v2/` when appropriate.

## Stack

- Go module at repo root; current backend code lives in `internal/v1/`.
- Exposed to the desktop UI through Wails (`internal/v1/app`); do not assume HTTP handlers for the default desktop flow.

## Testing

Follow [`.cursor/skills/go-tests/SKILL.md`](../../.cursor/skills/go-tests/SKILL.md): one root `TestX` per function under test, cases via `t.Run`, `require` for preconditions, `assert` for expectations, no testify suites.

For comment style on new or heavily edited exported APIs, see [`.cursor/skills/go-comments/SKILL.md`](../../.cursor/skills/go-comments/SKILL.md).

## Commands

- `go test ./internal/v1/...` or `go test ./...` from the repository root.
- Broader workflows: `make dev` (Wails + frontend) is defined in the root [`Makefile`](../../Makefile).

## Don’t

- Don’t hand-edit generated Wails TS bindings under `frontend/wailsjs/` from backend work; regenerate via Wails when models/APIs change.
- Don’t pull unrelated refactors into feature fixes.

For full setup and repo layout, see [`packages/docs/docs/contributing.md`](../../packages/docs/docs/contributing.md).
