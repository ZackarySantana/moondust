<div align="center">

[![Moondust](assets/brand/logo-wordmark-light.svg)](https://docs.moondust.pro)

**[Documentation](https://docs.moondust.pro)** · **[Storybook](https://docs.moondust.pro/storybook)** · **[Releases](https://github.com/zackarysantana/moondust/releases)**

</div>

<br />

Vector logos and banners live under [`assets/brand/`](assets/brand/). Source for the [documentation site](https://docs.moondust.pro) (`packages/docs`) and release branding.

## Install and run

On **[GitHub Releases](https://github.com/zackarysantana/moondust/releases)** you can read the notes and **download the binary** for your OS and CPU (**one binary per platform**; then run it locally; chmod +x on Unix if needed).

**Quick launch** via npm’s launcher (same binaries; use Bun or Node):

```bash
bunx moondust
```

```bash
npx moondust
```

The CLI picks a build for your OS/arch, caches it under `~/.cache/moondust/`, and runs it. Follow prompts if you want a different version.

## Docs and contributing

User docs (providers, Git sidebar, installation) live at **[docs.moondust.pro](https://docs.moondust.pro)** with source in [`packages/docs`](packages/docs/). For build-from-source and contributing, see the **Contributing** page there.

## Linux

Released binaries ship as a normal **executable** plus embedded static UI. **[Sash](https://github.com/zackarysantana/sash)** serves the bundle on **`127.0.0.1`** and launches your **default browser** as the desktop surface (no bundled WebKit / GTK dependency for that shell).

If **`zenity`** (or your OS’s dialogs) isn’t installed, **Pick folder** dialogs from the UI may misbehave; install your distro’s `zenity` package if prompted.

## Desktop app icon (developers)

Use **`build/appicon.png`** (square **PNG**, typically **1024×1024** with transparency) as the raster app icon referenced by packaging metadata under **`build/`**. Export from **`assets/brand/icon-app.svg`** (or the logo mark).

- **`build/windows/icon.ico`** remains optional for downstream Windows tooling (common sizes **16–256px** for taskbars).
