# Agent guidelines: Storybook (`frontend/.storybook/` + stories)

**Purpose:** Maintain isolated UI examples for components without running the full Wails app.

**Scope:** Config lives in [`main.ts`](main.ts), [`preview.ts`](preview.ts), and this folder. Stories live next to components as `frontend/src/**/*.stories.tsx`. Change Storybook config only when fixing preview/build behavior or shared decorators, not for one-off hacks that belong in a single story.

## Stack

- **Storybook 10** with [`storybook-solidjs-vite`](https://github.com/solidjs-community/storybook-solidjs-vite) (see [`main.ts`](main.ts)).
- **Vite:** `viteFinal` adds Tailwind (`@tailwindcss/vite`), `@` → `src/`, `@wails` → `wailsjs/`.
- **Production base path:** `main.ts` sets Vite `base` to `/storybook/` when `NODE_ENV === "production"` so the static build matches hosting under the docs site (see [`packages/docs/AGENT.md`](../../packages/docs/AGENT.md) / deploy workflow).

## `preview.ts`

- Imports global app styles: [`../src/style.css`](../src/style.css).
- **Docs / Autodocs:** `parameters.docs.story` uses `inline: false` and a fixed `height` so `position: fixed` modals render like Canvas (see comment in [`preview.ts`](preview.ts)).

## Commands

From `frontend/`:

- `bun run storybook`: dev server (default port 6006).
- `bun run build-storybook`: output to `storybook-static/` (also consumed by the docs deploy job).

## Story conventions

- **Wails models:** Use `store.*.createFrom(...)` with plain objects and **ISO strings** for times; avoid passing JS `Date` into fields that map to Go `time` (see existing stories and [`expandable-metric-list.stories.tsx`](../src/components/settings/expandable-metric-list.stories.tsx)).
- **Router:** Components using `<A>` or `useNavigate` need `MemoryRouter` + a matching `Route` (not `MemoryRouter` alone); see [`vertical-nav.stories.tsx`](../src/components/vertical-nav.stories.tsx).
- **TanStack Query:** For panels that use `useQuery`, wrap with `QueryClientProvider` and `setQueryData` for stable mock data (see OpenRouter metrics / Cursor CLI stories).

## Deploy

- Storybook is not a separate domain: the built `storybook-static` tree is copied under the Docusaurus output (see repo workflow). Keep asset paths consistent with `base` in `main.ts`.

For UI tokens and components, defer to [`../AGENT.md`](../AGENT.md) and [`.cursor/rules/frontend-design.mdc`](../../.cursor/rules/frontend-design.mdc).
