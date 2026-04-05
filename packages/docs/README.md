# Moondust docs

This site is built with [Docusaurus](https://docusaurus.io/). Use **Bun** for installs and scripts (same as the rest of the repo).

## Install

```bash
cd packages/docs
bun install
```

## Local dev

```bash
bun run start
```

Opens a dev server; most edits hot-reload.

## Build

```bash
bun run build
```

Output goes to `build/` for static hosting.

## Deploy (Docusaurus GitHub Pages helper)

With SSH:

```bash
USE_SSH=true bun run deploy
```

Without SSH (set your GitHub username):

```bash
GIT_USER=<username> bun run deploy
```

CI on `main` also builds with Bun; see `.github/workflows/docs-deploy.yml`.
