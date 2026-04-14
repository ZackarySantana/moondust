# Agent guidelines — desktop UI (`frontend/`)

**Purpose:** Ship SolidJS + Vite UI that matches Moondust patterns and talks to Go via Wails.

**Scope:** Work inside `frontend/` unless the task requires backend (`internal/`), docs (`packages/docs/`), or root Wails config. Do not hand-edit generated files under `wailsjs/`.

## Stack

- **SolidJS** (not React): signals, `createMemo`, `createEffect`; file-based components under `src/`.
- **Styling:** **Tailwind-only for component UI** — use utility classes on `class` (that is how Tailwind works); merge with `cn()` from [`src/lib/utils.ts`](src/lib/utils.ts). Put design tokens, base layers, and `@keyframes` in [`src/style.css`](src/style.css). Avoid inline `style={…}` and ad-hoc `<style>` in components except where a third-party API requires it (e.g. editor integrations).
- **Chat markdown is different:** [`ChatMarkdown`](src/components/chat-markdown.tsx) turns message text into HTML via `marked` and sets `innerHTML`, so inner tags are **not** Solid elements and **cannot** use Tailwind per-node. Prose styling lives under `.chat-markdown` / `.chat-markdown--user` in [`src/style.css`](src/style.css) (lists, code blocks, user-bubble contrast). Do not try to “fix” chat typography by sprinkling utilities on children—extend those scoped rules. Output is sanitized (DOMPurify) and links get `target="_blank"` + `rel`.
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
