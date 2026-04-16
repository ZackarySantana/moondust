---
sidebar_position: 3
---

# Git and review sidebar

While you chat, the **right sidebar** (thread view) is the place for repository work: status, diffs, review, and Git flows, all without leaving the thread.

## Status and changes

See **what changed** at a glance: staged and unstaged paths, with actions to **stage**, **unstage**, **discard**, and open **per-file diffs** in context.

## Branch review

**Branch review** compares your current branch against the project’s **default branch** (stored as a full remote ref, e.g. `origin/main`). The app keeps the remote reasonably fresh with background **fetch** so comparisons match what’s on the server, not only your local checkout.

You can run an **AI review** of the diff (using your configured providers), then **insert the draft into the main chat** to iterate with the full assistant, without sending automatically.

## Commit graph

The **Commits** area shows a **visual graph** of recent history: commits as nodes with parent relationships, a separator at the fork from the default branch, and **hover tooltips** (subject, author, date) with optional links when a remote URL is known.

## Git wizard

The **Git wizard** helps with common goals in plain language, for example **rebase** or **merge** onto a target branch (typically `origin/<branch>` after fetch).

For **rebases** with conflicts, Moondust can use the **utility model** (global Settings → utility provider + model) to **resolve conflicted files**, stage them, and **continue** the rebase or merge until the operation finishes. A single **status line** reflects what the app is doing (fetching, rebasing, resolving, continuing).

## Helper lanes (sidebar chat)

Alongside the main assistant, the sidebar supports **Quick question** (short answers using thread context), **Git wizard** (above), **commit message** suggestions in the commit UI, and **branch review**. Each can use the **utility model** from Settings when an LLM is needed, separate from the main thread’s chat provider.

---

For worktrees and multiple checkouts, see [Workspaces](workspaces).
