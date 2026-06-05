---
name: workstreams
description: Break a spec or task into local workstreams, dependency waves, and verification checkpoints before execution starts.
argument-hint: "[path-to-spec-or-phase] [--mvp] [--tdd] [--view]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

## Objective

Create a practical workstream breakdown for a non-trivial implementation.

This is a local planning command. It should not depend on any external SDK or remote workflow wrapper.

## Process

1. Load the source material:
   - explicit spec or phase path when provided
   - otherwise infer from the current planning context
2. Identify the major streams:
   - product or behavior changes
   - infra or config changes, if any
   - tests and verification
   - docs or migration follow-up
3. For each stream, define:
   - goal
   - owned files or surface area
   - dependencies
   - validation
   - whether it is parallel-safe
4. Group streams into waves.
5. If `--mvp` is present, prefer thin vertical slices over layer-by-layer decomposition.
6. If `--tdd` is present, add test scaffolding or harness work before implementation-heavy waves.
7. Present the workstream map in a format that can feed `plan-phase` or `execute-phase`.

## Output Format

```text
Workstream
Owner shape
Dependencies
Wave
Validation
```
