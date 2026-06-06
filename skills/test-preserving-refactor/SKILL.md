---
name: test-preserving-refactor
description: Use when code needs restructuring and observable behavior must stay unchanged, with existing tests kept green at every step.
---

## Purpose

Refactoring is only safe if it is backed by tests. Work in a strict loop — green baseline, one structural change, immediate re-run, revert on red — so you are never trapped in an uncompilable state.

## When to Use

- Code needs restructuring (extract/inline/move) without behavior change
- A previous refactor spiraled into a broken, hard-to-recover state
- Tests covering the target area exist or can be run

## Inputs

- The target area and the command that runs just its tests

## Workflow

1. **Run tests first.** Before touching any code, run the tests covering the target area. They MUST be green. If they are red, stop and fix the tests (or the code) first:

   ```bash
   npx jest path/to/target           # or: pytest tests/test_target.py -q
   ```

2. **Small steps.** Make one structural change at a time (e.g., extract a method).

3. **Run tests immediately** after the single structural change. The per-change loop:

   ```bash
   # repeat per structural change: edit -> test -> commit (green) | revert (red)
   npx jest path/to/target && git commit -am "refactor: extract X" || git checkout -- .
   ```

4. **Revert on red.** If the tests fail, you made a mistake. Revert the change (`git checkout -- .` or `git restore .`) and try a different approach. Do not attempt to "fix" the refactor while tests are failing.

5. **Commit on green.** Once the small change is green, consider it a safe checkpoint.

This strict loop prevents you from getting trapped in an uncompilable state.

## Output

- A chain of small, individually green commits
- The final test run output proving unchanged behavior

## Verification

- [ ] Baseline test run was green before the first edit
- [ ] Exactly one structural change per test cycle
- [ ] Every red result handled by revert, not forward-fixing
- [ ] Each green step committed as a checkpoint
- [ ] No test was modified to make the refactor pass

## Failure Modes

- **Refactoring on red** — starting from failing tests means you cannot tell what you broke.
- **Step batching** — three changes per test run; when it fails, you don't know which one did it.
- **Forward-fixing a broken refactor** — "fixing" while red digs the hole deeper; revert is cheaper.
- **Bending the tests** — editing assertions to match new behavior is a behavior change, not a refactor.
