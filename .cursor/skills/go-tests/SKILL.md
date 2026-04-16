---
name: go-tests
description: Writes and edits Go tests with testify require/assert, t.Run subtests, and one Test function per code under test; no suites. Use when adding or changing Go tests, running go test, or when the user mentions Go testing, testify, subtests, or TestFoo naming.
---

# Go tests (project rules)

These rules are **absolute** for this codebase.

## Structure

- **At most one root `Test…` function per function under test.** Do not attach multiple top-level `Test` functions to the same function (e.g. one `TestCreateProject` for `CreateProject`, not several).
- Use **`t.Run("subtest name", func(t *testing.T) { … })`** for all cases inside that single test function.

## Assertions

- Use **`github.com/stretchr/testify/require`** for preconditions and fatal checks (wrong setup, must-stop conditions).
- Use **`github.com/stretchr/testify/assert`** for ordinary expectations.
- **Do not** use testify **suites** (`suite.Suite`, `SetupTest`, etc.).

## Naming

- Root test name is **`Test` + the exported function or method name** under test (e.g. `TestOpenFile`, `TestCreateProject`, `TestNewService`, `TestClose`). Do **not** use a `Type_` prefix such as `TestStore_CreateProject`.

## Checklist

- [ ] One `TestX` per target function
- [ ] Subtests via `t.Run`
- [ ] `require` vs `assert` used as above
- [ ] No testify suites
