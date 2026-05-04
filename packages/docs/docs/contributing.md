---
sidebar_position: 2
---

# Contributing

Moondust is open source. Bug reports, doc fixes, and code contributions are welcome; use **GitHub Issues** and **Discussions** on the main repository to coordinate.

## Repository layout

| Path                                                                                       | Role                                                                                                                                        |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [`packages/studio/`](https://github.com/zackarysantana/moondust/tree/main/packages/studio) | Current desktop UI (SolidJS + Vite); embedded by the Go shell and served locally by Sash.                                                   |
| [`frontend/`](https://github.com/zackarysantana/moondust/tree/main/frontend)               | Older Solid app + Wails-generated `wailsjs/` (not used by [`main.go`](https://github.com/zackarysantana/moondust/blob/main/main.go) today). |
| [`internal/`](https://github.com/zackarysantana/moondust/tree/main/internal)               | Go services: app API, storage, git, terminal, legacy v1 stacks, etc.                                                                        |
| [`main.go`](https://github.com/zackarysantana/moondust/blob/main/main.go)                  | Sash entry (`sash.Run`); embeds `packages/studio/dist`.                                                                                     |
| [`sash.json`](https://github.com/zackarysantana/moondust/blob/main/sash.json)              | Sash project config (frontend install/build/dev, codegen for RPC bindings).                                                                 |
| [`Taskfile.yml`](https://github.com/zackarysantana/moondust/blob/main/Taskfile.yml)        | Repo tasks: dev, frontend build, cross-compile `dist-*` (same flows as CI).                                                                 |

## Prerequisites

- **Go** (see `go.mod` for the toolchain line used by the module).
- **[Sash](https://github.com/zackarysantana/sash)** CLI (`go install github.com/zackarysantana/sash/cmd/sash@latest`).
- **[Task](https://taskfile.dev/install/)** (optional; root `task` shortcuts mirror CI).
- **Bun**: the workspace uses Bun under `packages/` (see [`sash.json`](https://github.com/zackarysantana/moondust/blob/main/sash.json) `frontend.install` / `frontend.build` / `frontend.dev`).

## Run from source (development)

From the repository root (with **`sash` on `PATH`**; Task prepends **`$(go env GOPATH)/bin`** in the Taskfile):

```bash
task dev
```

(or `PATH="$(go env GOPATH)/bin:$PATH" sash dev`)

This builds/starts Studio via **Vite**, runs the Go API on the loopback listener from **`sash.json`**, and opens the app URL in your default browser.

To build **only** the bundled UI (what `embed` consumes):

```bash
task frontend
```

That runs **`bun install`** and **`bun run --filter @moondust/studio build`** under `packages/` (matching `sash build` frontend steps).

## Production-like binary

Cross-platform **`dist-*`** tasks live in the root **`Taskfile.yml`** (aligned with **[`.github/workflows/release.yml`](https://github.com/zackarysantana/moondust/blob/main/.github/workflows/release.yml)**):

```bash
task dist-linux-amd64
RELEASE_LABEL=v1.2.3 task dist-darwin-arm64   # embeds semver into internal/v2/buildinfo
```

## Documentation site

The Docusaurus site lives in [`packages/docs`](https://github.com/zackarysantana/moondust/tree/main/packages/docs).

```bash
cd packages/docs
bun install
bun run start
```

Then open the local URL printed in the terminal. `bun run build` runs a production build; broken internal links fail the build by design.

## Architecture (short)

For a high-level picture of how the desktop shell talks to Go and how chat streaming is wired, see [Architecture](architecture).
