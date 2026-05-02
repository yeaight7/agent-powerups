---
description: "Execute a comprehensive quality gate check (lint, test, build, format) before allowing code to merge."
argument-hint: "[--strict] [--fix]"
---

# Quality Gate Orchestrator

## CRITICAL BEHAVIORAL RULES

You MUST follow these rules exactly. Violating any of them is a failure.

1. **Execute checks sequentially.** Do NOT skip checks unless explicitly instructed.
2. **Halt on failure.** If any check fails and cannot be automatically fixed, STOP immediately. Present the error.
3. **Use local tools.** Rely on the project's configured tools (e.g., npm run lint, cargo test, etc.).
4. **Never enter plan mode autonomously.** Execute the quality gate directly.

## Pre-flight Checks

Identify the project type and available quality scripts (e.g., in package.json, Makefile, etc.).
Determine if `--strict` (fail on warnings) or `--fix` (attempt auto-fix) flags are present in `$ARGUMENTS`.

## Phase 1: Code Formatting and Linting

1. Run the project's formatting check (e.g., Prettier, rustfmt).
   - If `--fix` is passed, run the format-fix command instead.
2. Run the project's linting tool (e.g., ESLint, Clippy).
   - Capture warnings and errors.
   - If `--strict` is active, warnings count as failures.

## Phase 2: Automated Testing

1. Run the unit test suite.
2. Verify that all tests pass.
3. Check code coverage metrics if configured. Ensure they meet the project's baseline.

## Phase 3: Static Analysis and Build

1. Run type checking (e.g., tsc --noEmit) if applicable.
2. Run a trial build to ensure compilation succeeds without errors.

## Phase 4: Reporting

Generate a final quality gate report:

```markdown
# Quality Gate Results

## Summary
- **Status**: [PASS | FAIL]
- **Linting**: [X errors, Y warnings]
- **Testing**: [X passed, Y failed]
- **Type Check / Build**: [PASS | FAIL]

## Details
[List specific failures or areas of concern]

## Next Steps
[Provide exact commands or recommendations to resolve any failures]
```

## Validation Checklists

- [ ] Linting passes completely.
- [ ] Formatting aligns with standard rules.
- [ ] All tests execute and pass.
- [ ] Build completes without compilation errors.
