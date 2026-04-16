---
sidebar_position: 5
---

# Claude

Moondust drives **Claude Code** via the **`claude` CLI** from Anthropic. You must have the CLI **installed and on `PATH`**; the app does not bundle it.

## Install the CLI

If `claude` is not found, follow Anthropic’s [Claude Code installation guide](https://docs.anthropic.com/en/docs/claude-code).

## Authentication and models

- **Settings → Providers → Claude**: configure CLI-related options Moondust passes through for threads that use **Claude** as the chat provider.
- **Models** use Claude Code’s supported aliases (the app exposes a selectable list aligned with the CLI).

## Behavior

For each assistant turn, Moondust runs Claude in your **project directory** (or **thread worktree** when one is set) and streams the reply into the chat. Tool activity is shown when the integration returns tool rounds.

You can still use **OpenRouter** in other threads if you prefer a hosted API without the local CLI.
