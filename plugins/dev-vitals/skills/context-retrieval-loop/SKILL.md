---
name: context-retrieval-loop
description: Deterministic 3-cycle loop for gathering codebase context before acting. Broad search → exact source and tests → target-specific docs and setup. Stop after enough context or report what is still missing.
---

# Context Retrieval Loop

Gather the right codebase context before making changes or spawning subagents.

## When to Use

- Starting work in an unfamiliar area
- Spawning a subagent that needs targeted file context
- First search pass returned nothing useful

## The 3-Cycle Loop

### Cycle 1 — Broad Search

```bash
rg "<primary-keyword>" --type ts --type js -l
find . -name "*<keyword>*" -not -path "*/node_modules/*"
```

Stop here if 3+ directly relevant files found.

### Cycle 2 — Exact Source and Tests

Read the most relevant files from Cycle 1. Then find:
```bash
rg "<filename-stem>" --glob "*.test.*" --glob "*.spec.*" -l
rg "import.*<module-name>" -l
```

Stop here if you can describe the change and its blast radius.

### Cycle 3 — Docs and Setup

```bash
ls docs/ README.md AGENTS.md CLAUDE.md .claude/ 2>/dev/null
rg "<keyword>" .env.example *.config.* 2>/dev/null
```

## Stopping Conditions

Stop when: 3+ high-relevance files understood, OR Cycle 3 complete, OR new cycles return only files already seen.

## Output

```
Context gathered:
  <file-path> — <one-line reason>

Missing context (if any):
  <what is still unclear>
```

State gaps explicitly. Do not proceed with guesses when a known gap exists.

## Integration with Subagents

Pass file paths to subagents, not file contents:
```
Relevant files: src/auth/tokens.ts, src/auth/session.ts, src/auth/tokens.test.ts
```
