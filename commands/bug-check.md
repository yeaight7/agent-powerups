---
description: Run automated tests and build checks first, then agent code review. For each bug found, propose or document a regression test.
---

# /bug-check — Automated Bug Check

Mandatory automated checks precede agent review. Do not skip or reorder steps.

## Usage

`/bug-check [path|.]`

## Step 1 — Automated Tests (mandatory, cannot skip)

```bash
npm test        # or: pytest, cargo test, go test ./...
npm run build   # TypeScript build / type check
```

- Tests fail → report as highest priority; stop here until fixed
- Build fails → report type errors as highest priority; stop here until fixed
- Both pass → continue to Step 2

## Step 2 — Focused Code Review

Review for patterns that automated tests do not catch:

1. **Execution path parity** — do all code paths (sandbox, production, feature-flag variants) return the same response shape?
2. **Query completeness** — are all fields used in the response present in the query?
3. **Error state cleanup** — is stale state cleared when an error is returned?
4. **Optimistic update rollback** — is UI state reverted when an API call fails?

## Step 3 — Regression Tests

For every bug found and fixed, record one of:

```
Bug: <description>
File: <path>
Regression test: <test name and assertion>
```

or if a test cannot be written now:

```
Bug: <description>
Regression test: DEFERRED — <reason>
```

Do not silently skip. An explicit deferral is required.

## Arguments

$ARGUMENTS:
- `[path|.]` — optional target path
