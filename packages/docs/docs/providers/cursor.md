---
sidebar_position: 3
---

# Cursor

Moondust drives **Cursor Agent** via the **`agent` CLI** that ships with Cursor. You must have the CLI **installed and on `PATH`**; the app does not bundle it.

## Install the CLI

If `agent` is not found, install or update Cursor and ensure the Agent CLI is available. See Cursor’s install docs: [cursor.com/install](https://cursor.com/install).

## Authentication and models

- **Settings → Providers → Cursor**: configure how Moondust invokes the CLI for threads that use **Cursor** as the chat provider.
- **Models** are loaded from the CLI when possible (e.g. `agent --list-models`); the UI mirrors that list for thread model selection.

## Behavior

For each assistant turn, Moondust runs the agent in your **project directory** (or **thread worktree** when one is set), streams output into the chat, and records **tool calls** and usage metadata when the CLI exposes them.

If the CLI is missing or not authenticated, the app surfaces a clear error in the thread; fix the install or login, then retry.
