# Moondust brand assets (SVG)

These are **source** vector files for logos and marketing. They are not wired into the Wails binary by path; the **desktop app** uses a raster icon instead.

| File | Use |
| ---- | --- |
| `logo-mark.svg` / `logo-mark-light.svg` | Mark on dark vs light backgrounds |
| `logo-wordmark.svg` / `logo-wordmark-light.svg` | Horizontal lockups with wordmark |
| `icon-favicon.svg` | Small sizes / favicon |
| `icon-app.svg` | App icon composition (square, rounded rect) |
| `banner-hero.svg` | Wide hero / social preview inspiration |

**Documentation site:** copies live under [`packages/docs/static/img/`](../../packages/docs/static/img/) (e.g. `logo.svg`, `favicon.svg`).

**Desktop (Wails):** export **`build/appicon.png`** (1024×1024 PNG) from `icon-app.svg` or `logo-mark.svg`, place at [`build/appicon.png`](../../build/README.md). See the root [`README.md`](../../README.md) for the same steps.
