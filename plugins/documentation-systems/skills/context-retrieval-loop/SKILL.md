---
name: context-retrieval-loop
description: Deterministic 3-cycle loop for gathering documentation context before writing or updating docs. Broad search → exact source and existing docs → project conventions and setup.
---

# Context Retrieval Loop (Documentation)

Gather documentation context before writing or updating docs. Prevents duplicating existing content or violating project conventions.

## When to Use

- About to write a new doc, README section, or ADR
- Updating existing documentation and unsure of scope
- Spawning a documentation subagent that needs file context

## The 3-Cycle Loop

### Cycle 1 — Broad Search

```bash
# Find existing docs
find . -name "*.md" -not -path "*/node_modules/*" | head -30
rg "<topic>" docs/ *.md -l 2>/dev/null
```

Stop here if you find the existing doc that covers this topic.

### Cycle 2 — Source and Existing Docs

Read the source files the docs will describe. Find existing docs for the same area:

```bash
rg "<module-name>" docs/ -l
cat README.md | head -60
```

Stop here if you understand the scope of what needs to be written or updated.

### Cycle 3 — Conventions and Setup

```bash
ls docs/ .github/ 2>/dev/null
cat AGENTS.md CLAUDE.md 2>/dev/null | head -40
```

Check: Is there a doc style guide? A template? A contribution guide with doc requirements?

## Output

```
Context gathered:
  <file-path> — <reason>

Missing context (if any):
  <what is still unclear>
```

State gaps. Do not write documentation that contradicts undiscovered existing content.
