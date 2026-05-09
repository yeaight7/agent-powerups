---
name: memory-query-workflow
description: Use when querying, tracing, or explaining information from an existing graphify graph instead of rereading the full source corpus.
---

# Memory Query Workflow

Use built graph memory before reopening source files.

Check:

```powershell
apx check graphify
```

Required state:
- existing `graphify-out/graph.json`

Routing:
- broad question -> `graphify query`
- relationship trace -> `graphify path`
- concept explanation -> `graphify explain`
- no graph -> run `memory-build`
- stale graph -> recommend `graphify --update`

Rules:
- prefer graph retrieval over corpus reread
- say when graph is missing, stale, or weak

Reference:
- [`../graphify/UPSTREAM.md`](../graphify/UPSTREAM.md)
