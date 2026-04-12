---
sidebar_position: 2
---

# Contributing

Moondust is open source. Bug reports, doc fixes, and code contributions are welcome—use **GitHub Issues** and **Discussions** on the main repository to coordinate.

## Repository layout

| Path                                                                            | Role                                                           |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [`frontend/`](https://github.com/zackarysantana/moondust/tree/main/frontend)    | SolidJS + Vite UI, Wails bindings under `wailsjs/`.            |
| [`internal/`](https://github.com/zackarysantana/moondust/tree/main/internal)    | Go services: app API, storage, OpenRouter, git, terminal, etc. |
| [`main.go`](https://github.com/zackarysantana/moondust/blob/main/main.go)       | Wails entrypoint.                                              |
| [`wails.json`](https://github.com/zackarysantana/moondust/blob/main/wails.json) | Wails project config (frontend install/build commands).        |
| [`Makefile`](https://github.com/zackarysantana/moondust/blob/main/Makefile)     | Common **dev** and **release** build targets.                  |

## Prerequisites

- **Go** (see `go.mod` for the toolchain line used by the module).
- **Wails v2** CLI — [install](https://wails.io/docs/gettingstarted/installation) for your OS.
- **Bun** (or Node + npm) — the repo pins Bun for the frontend and docs; `wails.json` uses `bun` for `frontend:install` and `frontend:build`.

On **Linux**, WebKit2GTK is required at runtime for the desktop shell (same as [installation](getting-started/installation#linux)).

## Run from source (development)

From the repository root:

```bash
make dev
```

This runs `wails dev` with the WebKit tag used by the project. Hot reload applies to the frontend as configured by Wails.

To build only the frontend assets:

```bash
make frontend
```

That runs `bun install` and `bun run build` under `frontend/`.

## Production-like binary

Release-style targets are in the `Makefile` (e.g. `dist-linux-amd64`, `dist-darwin-arm64`). They build the frontend then invoke `wails build` for the requested platform. See the Makefile comments and CI workflows for details.

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
