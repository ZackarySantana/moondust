# Moondust

## Install and run

Requires [Node.js](https://nodejs.org/) 22+

```bash
npx moondust
```

The CLI installs the latest release for your OS/arch, caches it under `~/.cache/moondust/`, and runs it. If you want an older version, you can enter it when prompted.

## Linux

The desktop app links against **WebKit2GTK** at runtime. Install it first (names vary by distro). On Debian/Ubuntu:

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-0
```

If that package is missing, search for the one that provides `libwebkit2gtk-4.1.so.0` (e.g. `apt-cache search libwebkit2gtk`).
