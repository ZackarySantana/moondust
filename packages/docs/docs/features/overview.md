---
sidebar_position: 1
---

# Features overview

Moondust is a **desktop command center** for working with AI on real repositories. This page orients you at a high level; the app’s **Settings** screens are the source of truth for keys, models, and toggles.

## Projects and threads

**Projects** are workspaces rooted at a folder on disk (you can also create one from a remote). Each project has a **thread list**: separate conversations scoped to that repo. Threads can use optional **git worktrees** when you want isolation from your main checkout; details vary by workflow.

Project Git settings include a **default branch** as a full remote ref (e.g. `origin/main`) used for branch review and graph baselines.

See also [Workspaces](workspaces).

## Chat

Pick a **chat provider and model** per thread: **OpenRouter** (hosted API), **Cursor** (Cursor Agent CLI), or **Claude** (Claude Code CLI). Messages **stream** as the model replies. Models that support **reasoning / thinking** may show a thinking phase before the main answer. Tool calls can appear in a dense sequence; long runs of consecutive tools **collapse** in the UI (first + “N more” + last) with a control to expand.

Activity for active streams also appears in the **sidebar** so you can see progress when you switch threads or go back to the home view. See [Providers](../providers/overview).

## Utility model (helpers)

Global **Settings → Providers** includes a **utility model** (provider + model) used for one-off helpers: suggested **commit messages**, **branch review** drafts, **quick questions** in the sidebar, and **Git wizard** conflict resolution. It is separate from the main thread’s chat model so you can use a fast or cheap model for tooling.

## Review and Git sidebar

From a thread, the **right sidebar** covers repository workflow: working tree status, **diffs**, staging, commit, **branch review** vs the default remote branch, a **commit graph**, and a **Git wizard** for rebase/merge. See [Git and review sidebar](git-sidebar).

## Terminal

An **embedded terminal** is tied to the project/thread context so you can run commands next to the chat (bring-your-own shell workflow).

## Settings and shortcuts

Global preferences live under **Settings** in the app: projects, **providers** (OpenRouter, Cursor, Claude, utility model), git defaults, keyboard shortcuts, environments, agent tools, notifications, logs, and more. Each **project** also has its own settings (general, git, agent, environment, danger).

Use the in-app **shortcuts** page to see keybindings for your platform.
