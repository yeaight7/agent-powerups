---
name: bug-hunt
description: Use when reproducing, isolating, and fixing a bug with the smallest safe change.
---

## Purpose

Locate and fix the root cause of a bug with minimal scope. A correct fix beats a fast guess.

## When to Use

- A specific, reproducible bug needs fixing.
- A test is failing and the cause is unclear.
- An unexpected behavior needs a targeted fix.

For complex, persistent, or multi-component bugs, use `systematic-debugging` instead.

## Inputs

- Bug description or reproduction steps.
- Relevant error messages or stack traces.
- Access to the codebase and test suite.

## Workflow

1. **Reproduce** — Trigger the bug reliably before writing any code.
2. **Identify** — Find the true failing layer, not just the first place the error surfaces.
3. **Fix** — Apply the minimal change at the root cause.
4. **Test** — Add or update a focused test that would have caught this bug.

## Output

```
Root cause: <what caused the bug>
Fix: <what was changed and where>
Verification: <how the fix was confirmed>
Residual risk: <any edge cases not covered>
```

## Verification

- [ ] Bug reproduced before fix was written
- [ ] Root cause identified (not just symptom location)
- [ ] Fix is minimal — no unrelated changes bundled in
- [ ] Test added or updated to prevent regression

## Failure Modes

- **Fixing the symptom** — Error location ≠ root cause. Trace backward until the origin is found.
- **Skipping reproduction** — Fixes written without a reliable reproduction often miss the actual bug.
- **Missing test** — Without a regression test, the same bug is likely to return.
