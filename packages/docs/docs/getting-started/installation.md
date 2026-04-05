---
sidebar_position: 1
---

# Installation

On **[GitHub Releases](https://github.com/zackarysantana/moondust/releases)** you can **download the binary** for your machine: there is a **single binary per OS and CPU** (pick the matching asset, make it executable if needed, and run it).

## Quick launch

The [`moondust`](https://www.npmjs.com/package/moondust) package on npm is a small **launcher** that downloads the same kind of binary for your platform, caches it under `~/.cache/moondust/`, and starts the app. You can run it with **either** [Bun](https://bun.sh/) or Node.js (npm)—pick one:

```bash
bunx moondust
```

```bash
npx moondust
```

Both commands behave the same. Follow the prompts if you want a specific version instead of the default.

## Linux

:::caution[Extra dependency on Linux]

The desktop build needs WebKit2GTK on the host (not inside the binary). On Debian/Ubuntu: `sudo apt install libwebkit2gtk-4.1-0`. Package names differ elsewhere; if startup fails with a missing `libwebkit2gtk-4.1.so.0`, install your distro’s WebKit2GTK 4.1 runtime.

:::

## Models

Configure providers and keys in the app when prompted. Provider-specific notes live under [Providers](../providers/overview).
