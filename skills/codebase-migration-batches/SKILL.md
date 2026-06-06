---
name: codebase-migration-batches
description: Use when a wide refactor or migration is too large to ship as one change — API renames across many files, framework or config migrations, or mechanical codemod-backed refactors that need reviewable batches.
---

# Codebase Migration Batches

Use this skill for broad, repetitive refactors that should move in slices.

## When to Use

- API renames across many files
- Framework or config migrations
- Mechanical refactors backed by codemods or search/replace rules
- Any change where "all at once" would be too large to review safely

## Core Rules

- Define the transform precisely before editing files
- Keep one migration theme per batch
- Prefer deterministic codemods over manual repetition
- Maintain a batch ledger so already-migrated files are not touched twice
- Validate each batch before moving to the next
- No auto-commit, auto-push, or auto-PR

## Workflow

1. **Define the migration**
   - What changes
   - What does not change
   - How success is measured

2. **Measure the blast radius**
   - Count affected files
   - Sample representative files
   - Identify edge cases before the first codemod pass

3. **Choose batch size**
   - Small enough to review and debug
   - Large enough to make visible progress

4. **Run the transform**
   - Prefer AST-aware tools when syntax matters
   - Use plain search/replace only for truly mechanical edits
   - Keep any helper scripts under versioned project control if they are reused

5. **Verify the batch**
   - Run targeted tests first
   - Run broader validation when the batch changes shared primitives
   - Track residual manual fixes separately from the codemod logic

6. **Advance or stop**
   - Continue if the batch is stable
   - Shrink the batch if review or validation gets noisy
   - Stop and redesign the transform if repeated manual cleanup dominates

## Batch Ledger

Track at least:

```text
Batch ID
Files included
Transform rule
Validation run
Known exceptions
```

## Verification

- [ ] The transform was defined precisely — what changes, what does not — before the first file edit
- [ ] Each batch held one migration theme and passed validation before the next began
- [ ] The batch ledger records files, transform rule, validation run, and exceptions for every batch
- [ ] No already-migrated file was touched twice; no auto-commit, auto-push, or auto-PR occurred
