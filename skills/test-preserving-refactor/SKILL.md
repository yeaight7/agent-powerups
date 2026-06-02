---
name: test-preserving-refactor
description: "Use to restructure code while guaranteeing that all existing tests continue to pass."
---

# Test-Preserving Refactor

Refactoring is only safe if it is backed by tests.

## The Protocol

1. **Run Tests First**: Before touching any code, run the tests covering the target area. They MUST be green. If they are red, stop and fix the tests (or the code) first.
2. **Small Steps**: Make one structural change at a time (e.g., extract a method). 
3. **Run Tests Immediately**: Run the tests immediately after the single structural change.
4. **Revert on Red**: If the tests fail, you made a mistake. Revert the change (`git checkout` or `ctrl+z`) and try a different approach. Do not attempt to "fix" the refactor while tests are failing.
5. **Commit**: Once the small change is green, consider it a safe checkpoint.

This strict Red/Green/Refactor cycle prevents you from getting trapped in an uncompilable state.