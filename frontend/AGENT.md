# Agent guidelines — desktop UI (`frontend/`)

**Purpose:** Ship SolidJS + Vite UI that matches Moondust patterns and talks to Go via Wails.

**Scope:** Work inside `frontend/` unless the task requires backend (`internal/`), docs (`packages/docs/`), or root Wails config. Do not hand-edit generated files under `wailsjs/`.

## Stack

- **SolidJS** (not React): signals, `createMemo`, `createEffect`; file-based components under `src/`.
- **Styling:** Tailwind CSS v4 via `@theme` in [`src/style.css`](src/style.css); merge classes with `cn()` from [`src/lib/utils.ts`](src/lib/utils.ts).
- **Design tokens & UI rules:** [`.cursor/rules/frontend-design.mdc`](../.cursor/rules/frontend-design.mdc) (colors, spacing, icons, typography).
- **Aliases:** `@/` → `src/`, `@wails` → `wailsjs` (see [`vite.config.ts`](vite.config.ts)).

## Tooling

- **Bun** — `packageManager` in [`package.json`](package.json).
- `bun run dev` — Vite dev (also used by Wails).
- `bun run build` — production bundle.
- `bun run test` — Vitest.

## Patterns

- **Data:** TanStack Query for IPC-backed reads; align with existing `queryKeys` in [`src/lib/query-client.ts`](src/lib/query-client.ts).
- **Router:** `@solidjs/router` — router-dependent UI must run inside a matched `Route` when using `<A>` (see Storybook notes).
- **Stories:** Colocated `*.stories.tsx` next to components; Storybook-only details live in [`.storybook/AGENT.md`](.storybook/AGENT.md).

## Don’t

- Don’t introduce a second styling system or duplicate the design doc in commits.
- Don’t expand scope into unrelated routes or settings tabs without a clear ask.

For contributor setup and Wails, see [`packages/docs/docs/contributing.md`](../packages/docs/docs/contributing.md).
