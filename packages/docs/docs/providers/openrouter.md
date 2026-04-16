---
sidebar_position: 2
---

# OpenRouter

[OpenRouter](https://openrouter.ai/) aggregates many models behind one API. In Moondust it is one of **three** chat backends (alongside **Cursor** and **Claude** CLIs): you pick **OpenRouter** as the thread provider, then choose models from OpenRouter’s catalog.

## Authentication

In **Settings → Providers**, you can:

- **Connect with OAuth**: opens a browser flow (see OpenRouter’s docs for OAuth; local development may require a free port).
- **Paste an API key**: from [openrouter.ai/keys](https://openrouter.ai/keys).

You can clear the stored key from the same screen.

## Models

The model list is loaded from OpenRouter’s **models API** (filtered in the app). Metadata such as context length, pricing hints, and **reasoning** capability comes from that list when available. If the request fails, the UI falls back to a small built-in list until the catalog loads again.

## Chat behavior

- Replies **stream** token-by-token.
- Models that expose **reasoning / thinking** traces may show a thinking phase before the visible answer; the UI reflects that when the API sends reasoning deltas.

For API details, pricing, and rate limits, see [OpenRouter’s documentation](https://openrouter.ai/docs) and their site; details are not duplicated here.
