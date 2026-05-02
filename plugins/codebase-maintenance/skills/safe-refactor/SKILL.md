---
name: safe-refactor
description: Use when code needs restructuring without changing observable behavior.
---

## Purpose

Restructure code in small, safe steps while preserving all externally observable behavior. Prevents refactor regressions where behavior silently changes.

## When to Use

- Code needs structural improvement but its public API must remain unchanged.
- Naming, organization, or duplication needs cleanup after a feature is complete.
- Technical debt needs reduction without introducing risk.

Do not use this skill if there are no existing tests — write tests first.

## Inputs

- Code to refactor.
- Existing test suite (required).
- Optional: specific goals (extract function, rename module, remove duplication).

## Workflow

1. **Confirm behavior** — Run the test suite. All tests must pass before starting.
2. **Plan** — List the structural changes. Check each for API impact.
3. **Refactor in small steps** — One change at a time, each independently reversible.
4. **Avoid interface changes** — Do not alter public APIs, exported types, or CLI behavior unless explicitly intended.
5. **Validate after each step** — Re-run targeted tests after each meaningful change.

## Output

```
Changed:
- <structural change 1>
- <structural change 2>

Behavior unchanged because: <reasoning>

Validated by: <test commands run>
```

## Verification

- [ ] Tests pass before starting
- [ ] Each step is small and independently reversible
- [ ] No unintended API or interface changes introduced
- [ ] Tests pass after each meaningful step
- [ ] Final test suite fully green

## Failure Modes

- **Missing tests** — Stop. Write tests before refactoring. Behavior cannot be verified otherwise.
- **Silent API change** — If a refactor touches public interfaces, stop and confirm this is intentional.
- **Bundled unrelated changes** — Keep each step focused. Mixed changes make rollback and blame impossible.
