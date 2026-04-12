---
sidebar_position: 1
---

# Features overview

Moondust is a **desktop command center** for working with AI on real repositories. This page orients you at a high level; it is not a click-by-click manual (those live in the app under **Settings**).

## Projects and threads

**Projects** are workspaces rooted at a folder on disk (you can also create one from a remote). Each project has a **thread list**: separate conversations scoped to that repo. Threads can use optional **git worktrees** when you want isolation from your main checkout—details vary by workflow.

See also [Workspaces](workspaces).

## Chat

Messages **stream** as the model replies. Models that support **reasoning / thinking** may show a thinking phase before the main answer. Activity for active streams also appears in the **sidebar** so you can see progress when you switch threads or go back to the home view.

Chat is backed by **OpenRouter** today; see [Providers](../providers/overview).

## Review and Git

From a thread you get a **review** view of git state: changed files, diffs, and common actions (stage, discard, commit, branch flows) without leaving the conversation. Per-file **diff** opens when you drill into a path.

## Terminal

An **embedded terminal** is tied to the project/thread context so you can run commands next to the chat (bring-your-own shell workflow).

## Settings and shortcuts

Global preferences live under **Settings** in the app: projects, providers, git defaults, keyboard shortcuts, environments, agent tools, notifications, logs, and more. Each **project** also has its own settings (general, git, agent, environment, danger).

Use the in-app **shortcuts** page to see keybindings for your platform.
