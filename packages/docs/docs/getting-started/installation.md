---
sidebar_position: 1
---

# Installation

[Node.js](https://nodejs.org/) 22 or newer is required.

## npx

```bash
npx moondust
```

Downloads a release for your OS and CPU, caches under `~/.cache/moondust/`, and starts the app. Follow prompts to pick a version.

## What you get

- Windows, macOS, or Linux: native build from [GitHub Releases](https://github.com/zackarysantana/moondust/releases).
- npm package [`moondust`](https://www.npmjs.com/package/moondust): launcher only; the app binary is fetched per platform.

## Linux

:::caution[Extra dependency on Linux]

The desktop build needs WebKit2GTK on the host (not inside the binary). On Debian/Ubuntu: `sudo apt install libwebkit2gtk-4.1-0`. Package names differ elsewhere; if startup fails with a missing `libwebkit2gtk-4.1.so.0`, install your distro’s WebKit2GTK 4.1 runtime.

:::

## Models

Configure providers and keys in the app when prompted. Provider-specific notes live under [Providers](../providers/overview).
