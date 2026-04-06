---
name: go-tests
description: Writes and edits Go tests with testify require/assert, t.Run subtests, and one Test function per code under test—no suites. Use when adding or changing Go tests, running go test, or when the user mentions Go testing, testify, subtests, or TestFoo naming.
---

# Go tests (project rules)

These rules are **absolute** for this codebase.

## Structure

- **At most one root `Test…` function per function under test.** Do not attach multiple top-level `Test` functions to the same function (e.g. one `TestStore_Foo` for `(*Store).Foo`, not several).
- Use **`t.Run("subtest name", func(t *testing.T) { … })`** for all cases inside that single test function.

## Assertions

- Use **`github.com/stretchr/testify/require`** for preconditions and fatal checks (wrong setup, must-stop conditions).
- Use **`github.com/stretchr/testify/assert`** for ordinary expectations.
- **Do not** use testify **suites** (`suite.Suite`, `SetupTest`, etc.).

## Naming

- Name tests after what they exercise, e.g. `TestOpenFile`, `TestStore_CreateProject` for methods.

## Checklist

- [ ] One `TestX` per target function
- [ ] Subtests via `t.Run`
- [ ] `require` vs `assert` used as above
- [ ] No testify suites
