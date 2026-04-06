---
name: go-comments
description: Reviews Go code comments as a reviewer: keeps only rationale ("why"), strips redundant "what" comments. Use when reviewing PRs or diffs, cleaning up Go files, or when the user asks to fix, tighten, or audit comments in Go code.
---

# Go comments (reviewer mode)

Assume this runs **during review** (PR or pre-merge cleanup), not necessarily while first authoring code. Act like a reviewer **fixing comments**, not just suggesting them.

These rules are **absolute**:

## What to keep

- Comments that explain **why** something exists or is shaped a certain way: design tradeoffs, constraints, non-obvious coupling, API shape (e.g. why nil vs error), why env/path/layout choices were made.

## What to remove or rewrite

- Comments that only restate **what** the code does (the name, signature, or obvious control flow already says it).
- Boilerplate like "struct X", "returns Y", "opens the file" with no extra rationale.

## How to fix

- **Delete** pure "what" comments.
- **Rewrite** thin comments into "why" or delete if the code should stand alone.
- **Preserve** package/type docs only when they add rationale (why this package boundary, why this field exists). Drop restatement of obvious behavior.

## Non-goals

- Do not add comments just to satisfy doc coverage if they would only duplicate the code.
- Do not replace deleted noise with longer noise; silence is fine when the code is clear.

## Checklist (reviewer)

- [ ] Every remaining comment answers "why would a maintainer need this hint?"
- [ ] No comment merely narrates what the next line does
- [ ] Exported APIs still have a "why" where the design choice is not obvious from names alone
