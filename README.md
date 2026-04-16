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

The desktop app links against **WebKit2GTK** at runtime. Install it first (names vary by distro). On Debian/Ubuntu:

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-0
```

If that package is missing, search for the one that provides `libwebkit2gtk-4.1.so.0` (e.g. `apt-cache search libwebkit2gtk`).

## Desktop app icon (developers)

Wails bundles the window and OS icon from **`build/appicon.png`** (square **PNG**, typically **1024×1024** with transparency). Export it from **`assets/brand/icon-app.svg`** (or the logo mark) in Figma, Inkscape, or ImageMagick, then run **`wails build`**.

- Put the file at **`build/appicon.png`** (repository root `build/` folder).
- Windows also uses **`build/windows/icon.ico`**; Wails can generate it from `appicon.png` during build when that file is absent. To supply your own `.ico`, replace the generated file and keep sizes common for the taskbar (16–256px).

If `appicon.png` is missing, Wails creates a default placeholder on first build.
