---
name: memory-optimization-workflow
description: Use when deciding the lowest-cost context path for a mixed corpus, especially when choosing among direct reading, helper conversion, graph build, graph update, or graph query.
---

# Memory Optimization Workflow

## Overview

Minimize token spend, reread cost, and unnecessary rebuilds.

`graphify` is the main optimization path for repeated work. Helper tools exist to make hard sources cheaper before graph or direct reading.

## When to Use

- mixed corpus and the cheapest inspection path is unclear
- repeated questions over the same files
- need to choose between direct read, conversion, graph build, update, or query
- want to reduce repeated large-context rereads

Do not use for:
- tiny single-file questions where direct reading is already cheapest
- cases where the user explicitly wants raw-file inspection only

## Required Checks

```powershell
apx check graphify
apx check markitdown-file-intake
apx check defuddle
```

Stop and report missing tools. Do not auto-install without approval.

## Fast Routing

| Situation | Cheapest path |
|---|---|
| small readable text corpus, one question | read directly |
| PDF, Office doc, or other binary-like source | `markitdown-file-intake` |
| noisy web page or article | `defuddle` |
| repeated questions across same corpus | build with `graphify` |
| existing graph plus changed sources | `graphify --update` |
| existing graph plus new question | query graph first |

## Decision Rules

- prefer direct reading for small plain-text scope
- prefer Markdown over binary or chrome-heavy formats
- prefer graph query over full reread when a graph already exists
- prefer incremental update over rebuild
- keep helper tools secondary to the main graph path
- keep Obsidian optional; it is not part of the optimization decision unless the user wants vault browsing

## Escalation Ladder

1. Direct read if scope is already small and readable.
2. Convert only if format is the main source of waste.
3. Build graph memory when questions will repeat or corpus is broad.
4. Update existing graph when sources changed.
5. Query existing graph before any broad reread.

## Common Failure Modes

- building a graph for a tiny one-shot question
- rereading large corpora after a graph already exists
- converting already-readable Markdown or code
- rebuilding instead of updating
- making helper tools feel primary instead of supportive

## Verification

- [ ] Required tool checks ran; missing tools were reported, not auto-installed
- [ ] The chosen path matches the routing table — direct read for small readable scope
- [ ] No graph was built for a tiny one-shot question
- [ ] An existing graph was queried or updated instead of rereading the corpus
- [ ] Helpers stayed secondary to the main graph path

## References

- [`../../references/HELPER_TOOLS.md`](../../references/HELPER_TOOLS.md)
- [`../../references/GRAPHIFY_PROVENANCE.md`](../../references/GRAPHIFY_PROVENANCE.md)
