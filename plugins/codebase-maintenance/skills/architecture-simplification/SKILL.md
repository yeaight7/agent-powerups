---
name: architecture-simplification
description: Use when a codebase carries over-engineered abstractions, unnecessary layers, or redundant logic that should be collapsed without changing behavior.
---

## Purpose

Over time, codebases accumulate "just in case" abstractions. This skill guides the safe removal of unnecessary complexity: remove the noise around the core logic without changing the core logic itself.

## When to Use

- An interface has only one implementation and no second one is planned
- A wrapper, factory, or layer only passes arguments straight through
- Two code paths do the same thing and should be consolidated

## Inputs

- The suspect abstraction(s) and their call sites
- A green test suite covering the affected area

## Workflow

1. **Identify the abstraction cost.** Does this interface have only one implementation? Does this wrapper class just pass arguments straight through? Measure before cutting:

   ```bash
   grep -rn "implements IUserRepository" src/    # count implementations
   grep -rn "IUserRepository" src/ | wc -l       # count references
   ```

2. **Run the tests first.** The affected area must be green before any removal — this is the behavioral baseline.

3. **Inline the logic.** Move the logic from the unnecessary abstraction directly into the caller.

4. **Delete the dead code.** Remove the interface, wrapper, or factory that is no longer needed.

5. **Test verification.** Re-run the same tests; the observable behavior of the system must not have changed.

**Example:** if a `UserRepository` implements `IUserRepository` but there is only ever one database, inline `UserRepository` and delete `IUserRepository`.

## Output

- The simplified code with the abstraction removed
- Before/after test evidence showing unchanged behavior

## Verification

- [ ] Tests covering the area were green before the change (baseline)
- [ ] Same tests green after the change — observable behavior preserved
- [ ] No references to the removed abstraction remain (searched, not assumed)
- [ ] Diff contains only removal/inlining — no core-logic rewrites

## Failure Modes

- **Rewrite disguised as simplification** — do not rewrite the entire subsystem; simplification removes the noise around the core logic, not the logic itself.
- **Cutting without a baseline** — without a green pre-change test run, "tests pass after" proves nothing.
- **Speculative retention** — keeping the interface "in case we need it later" recreates the original problem.
