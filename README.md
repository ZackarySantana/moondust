# Moondust

## Install and run

On **[GitHub Releases](https://github.com/zackarysantana/moondust/releases)** you can read the notes and **download the binary** for your OS and CPU—**one binary per platform** (then run it locally; chmod +x on Unix if needed).

**Quick launch** via npm’s launcher (same binaries—use Bun or Node):

```bash
bunx moondust
```

```bash
npx moondust
```

The CLI picks a build for your OS/arch, caches it under `~/.cache/moondust/`, and runs it. Follow prompts if you want a different version.

## Linux

The desktop app links against **WebKit2GTK** at runtime. Install it first (names vary by distro). On Debian/Ubuntu:

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-0
```

If that package is missing, search for the one that provides `libwebkit2gtk-4.1.so.0` (e.g. `apt-cache search libwebkit2gtk`).
