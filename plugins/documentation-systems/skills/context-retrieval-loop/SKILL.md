---
name: context-retrieval-loop
description: Use when about to write a new doc, README section, or ADR, updating existing documentation with unclear scope, or spawning a documentation subagent that needs file context.
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

## Verification

- [ ] Existing docs were searched before writing — duplication ruled out or the covering doc identified
- [ ] The source files the docs describe were read, not assumed
- [ ] Doc conventions (style guide, templates, contribution rules) were checked
- [ ] Gaps are stated explicitly; nothing written contradicts existing content
