# Agent guidelines — documentation site (`packages/docs/`)

**Purpose:** Keep the Docusaurus user docs accurate, link-safe, and consistent with the product.

**Scope:** Edit Markdown/MDX under [`docs/`](docs/) and supporting config here unless the task requires the frontend app or backend. Run a local build before declaring links or imports fixed.

## Stack

- **Docusaurus** v3 (classic preset); config in [`docusaurus.config.ts`](docusaurus.config.ts).
- **`url` / `baseUrl`:** Production site is configured there; internal links should resolve for `onBrokenLinks: "throw"` (broken links fail the build).
- **Package manager:** Bun (see [`package.json`](package.json)).

## Commands

From `packages/docs/`:

- `bun install`
- `bun run build` — must succeed before merging doc changes that touch links or nav.
- `bun run start` — local preview.

## Deployment

- GitHub Pages workflow: [`.github/workflows/docs-deploy.yml`](../../.github/workflows/docs-deploy.yml) builds this site **and** the Storybook static bundle, then merges them. Path filters in that workflow decide when deploy runs—large unrelated edits only under `docs/` still trigger a docs deploy when pushed to `main`.

## Style

- User-facing, concise prose; follow the tone of existing pages such as [`docs/contributing.md`](docs/contributing.md).
- Prefer updating the existing page over adding duplicate overview content.

For install-from-source and repo layout, point readers to **Contributing** rather than duplicating long sections here.
