---
name: context-retrieval-loop
description: Deterministic 3-cycle loop for gathering codebase context before refactoring or maintenance work. Broad search → exact source and tests → config and build setup.
---

# Context Retrieval Loop (Codebase Maintenance)

Gather context before any refactor or maintenance task. Prevents breaking undetected callers or missing test coverage.

## When to Use

- About to refactor, rename, or remove code
- Assessing dead code before deletion
- Unsure of the blast radius of a change

## The 3-Cycle Loop

### Cycle 1 — Broad Search

```bash
# Find callers and references
rg "<symbol-name>" --type ts --type js -l
rg "<symbol-name>" --glob "*.py" -l
```

Stop here if you can confirm the symbol is unused (no results).

### Cycle 2 — Exact Source and Tests

Read the target file and its tests. Find all callers:

```bash
rg "import.*<module>" -l
rg "<function-name>" --glob "*.test.*" -l
```

Stop here if you understand the change scope and existing test coverage.

### Cycle 3 — Config and Build

```bash
# Check if symbol appears in build or config
rg "<symbol-name>" *.config.* tsconfig.json Makefile -l 2>/dev/null
```

Check for re-exports, barrel files, and public API surfaces.

## Output

```
Context gathered:
  <file-path> — <reason>

Blast radius:
  <N> callers in <N> files
  Tests covering this code: <yes/no/partial>

Missing context (if any):
  <what is still unclear>
```

Do not start a refactor without knowing the blast radius. If callers are unclear after Cycle 3, stop and report.
