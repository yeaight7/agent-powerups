---
name: ai-slop-cleaner
description: Run an anti-slop cleanup workflow on AI-generated code — regression-tests-first, smell-by-smell, behavior preserved. Supports explicit review-only mode.
---

## Purpose

Reduce AI-generated code bloat through systematic, smell-by-smell cleanup that preserves existing behavior and raises signal quality.

## When to Use

- A code path works but feels bloated, noisy, repetitive, or over-abstracted.
- A user asks to "cleanup", "refactor", or "deslop" AI-generated output.
- Follow-up implementation left duplicate code, dead code, weak boundaries, or missing tests.
- A disciplined cleanup workflow is needed without broad rewrites.
- The user wants a reviewer-only anti-slop pass via `--review` mode.

This skill accepts an optional **file list scope**. If a changed-files list is provided, keep the cleanup strictly bounded to those files. Do not silently expand a changed-file scope.

## Inputs

- Codebase or module to clean (or explicit file list scope).
- Existing test suite (required — behavior must be locked before editing).

## Workflow

1. **Lock behavior with regression tests first**
   - Identify the behavior that must not change.
   - Add or run targeted regression tests before touching cleanup candidates.
   - If behavior is currently untested, write the narrowest test coverage needed first.

2. **Create a cleanup plan before code**
   - List the specific smells to remove.
   - Bound the pass to the requested files/scope.
   - Order fixes from safest/highest-signal to riskiest.
   - Do not start coding until the cleanup plan is explicit.

3. **Categorize issues**
   - **Duplication** — repeated logic, copy-paste branches, redundant helpers
   - **Dead code** — unused code, unreachable branches, stale flags, debug leftovers
   - **Needless abstraction** — pass-through wrappers, speculative indirection, single-use helper layers
   - **Boundary violations** — hidden coupling, leaky responsibilities, wrong-layer imports or side effects
   - **Missing tests** — behavior not locked, weak regression coverage, gaps around edge cases

4. **Execute passes one smell at a time**
   - Pass 1: Dead code deletion
   - Pass 2: Duplicate removal
   - Pass 3: Naming and error handling cleanup
   - Pass 4: Test reinforcement
   - Re-run targeted verification after each pass.
   - Do not bundle unrelated refactors into the same edit set.

5. **Run quality gates**
   - Regression tests stay green.
   - Lint passes.
   - Typecheck passes.
   - Relevant unit/integration tests pass.
   - Diff stays minimal and scoped.
   - No new abstractions or dependencies unless explicitly required.

## Review Mode (`--review`)

If invoked with a `--review` flag, operate as a reviewer-only pass:
1. Do **not** start by editing files.
2. Review the cleanup plan, changed files, and regression coverage.
3. Check specifically for leftover dead code, duplicate logic, needless wrappers, and missing tests for preserved behavior.
4. Produce a reviewer verdict with required follow-ups.
5. Hand needed changes back to a separate writer pass instead of fixing and approving in one step.

## Output

```
AI SLOP CLEANUP REPORT
======================

Scope: [files or feature area]
Behavior Lock: [targeted regression tests added/run]
Cleanup Plan: [bounded smells and order]

Passes Completed:
1. Dead code deletion - [concise fix]
2. Duplicate removal - [concise fix]
3. Naming/error handling cleanup - [concise fix]
4. Test reinforcement - [concise fix]

Quality Gates:
- Regression tests: PASS/FAIL
- Lint: PASS/FAIL
- Typecheck: PASS/FAIL
- Tests: PASS/FAIL

Changed Files:
- [path] - [simplification]

Remaining Risks:
- [none or short deferred item]
```

## Verification

- [ ] Regression tests written or confirmed before any edits
- [ ] Cleanup plan explicit before coding started
- [ ] Each pass limited to one smell category
- [ ] Quality gates pass after each pass
- [ ] Diff is minimal and scoped — no unrelated changes

## Failure Modes

- **Editing before tests** — Never clean up code whose behavior isn't locked by tests.
- **Multi-smell passes** — Bundling smell categories into one large refactor makes verification impossible.
- **Scope creep** — If given a file list scope, stay within it. Do not expand to adjacent files.
