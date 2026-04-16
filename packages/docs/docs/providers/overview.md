---
sidebar_position: 1
---

# Overview

Moondust connects to upstream model APIs using credentials you configure in the app. Endpoints, auth, and model identifiers depend on the provider.

Nothing here ranks one vendor over another. Pick what fits your workflow and billing.

## Status

| Provider   | Status in Moondust | How it works |
| ---------- | ------------------ | ------------ |
| OpenRouter | **Implemented**    | Hosted API in the app (OAuth or API key). [OpenRouter](openrouter) |
| Cursor     | **Implemented**    | **Cursor Agent CLI** (`agent` on `PATH`). [Cursor](cursor) |
| Claude     | **Implemented**    | **Claude Code** CLI (`claude` on `PATH`). [Claude](claude) |
| Codex      | Planned            | [Codex](codex) |
| Pi         | Planned            | [Pi](pi) |

Pick a **provider and model per thread** in the chat UI. **Utility** features (commit message suggestion, branch review helper, quick question, Git wizard conflict resolution) use the **utility model** from **Settings → Providers** and can point at OpenRouter, Cursor, or Claude independently of the main thread.

For setup details, open the doc in the third column for each implemented provider.
