---
name: build-fix-minimal-diff
description: Fix broken builds, type errors, or test failures with the smallest safe diff — no opportunistic refactors, no cleanup, no unrelated changes.
---

# Build Fix — Minimal Diff

Fix the failing build, test, or type check. Nothing else.

## When to Use

- A CI build is red and blocking other work
- Tests pass locally but fail in CI — or vice versa
- Type errors or lint errors block a commit or pipeline
- A previous change broke a test that was passing

## Core Rule

**Touch only what is broken. Fix the root cause. Rerun. Done.**

Any unrelated improvement — even a one-line cleanup — is out of scope for this skill.

## Inputs

- The exact failing command (e.g., `npm test`, `cargo build`, `tsc --noEmit`, `pytest`)
- The full error output — exact messages and line numbers, not a summary
- Current branch state (`git status --short`, `git diff --stat`)

## Workflow

### 1. Reproduce

Run the exact failing command and confirm it fails with the same error.

If it does not fail locally:
- Check environment differences: tool versions, env vars, installed packages, generated files
- Run a clean install (`npm ci`, `pip install -r requirements.txt`, etc.) and retry
- Document the environment discrepancy instead of guessing at a fix

### 2. Isolate

- Read the error output from the first line — the first error is usually the root cause; later errors are often cascades
- Identify the single failure point: file, line number, symbol, or command
- Do not start changing code until the root cause is clearly identified

### 3. Fix

- Apply the minimal change that addresses the identified root cause
- One change at a time
- Do not touch adjacent code, even if it looks wrong — log it as a follow-up
- Do not update test expectations to make tests pass unless the expectations were genuinely wrong (i.e., the code behavior is now correct and the test was testing the old — wrong — behavior)

### 4. Rerun

- Run the exact failing command: it must exit 0
- Run the full test suite to confirm no regressions introduced

### 5. Report

```
FIXED: <what was broken — command and error>
CAUSE: <root cause — specific, not vague>
CHANGE: <file:line — what was changed and why>
VERIFIED: <command run> → exit 0
REGRESSIONS: none / [list]
DEFERRED: <adjacent issues noticed but not touched>
```

## Verification

- Exact failing command exits 0 after the fix
- Full test suite still passes
- No files modified beyond the narrowest fix

## Failure Modes

- Fixing a cascade error instead of the root cause — go back to step 2
- Changing test assertions to match broken implementation — only valid when the test was wrong, never when the code is wrong
- Multiple changes at once — revert all but the smallest hypothesis and retry
- "While I'm here" scope creep — log it as a follow-up task, do not include it in this fix

## Sources / Inspiration

Inspired by `Yeachan-Heo/oh-my-codex` `prompts/build-fixer.md`. Rewritten in Agent Powerups style.
