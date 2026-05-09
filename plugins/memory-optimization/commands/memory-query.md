---
name: memory-query
description: Query an existing graphify graph before rereading the full corpus, using query, path, or explain flows.
argument-hint: "<question-or-node>"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
---

<objective>
Use graph-backed memory first. Query existing graph state before reopening source documents.
</objective>

<process>
1. Check `apx check graphify`.
2. Confirm `graphify-out/graph.json` exists.
3. If graph missing, stop and direct user to `memory-build`.
4. Route request:
   - broad question -> `graphify query`
   - relationship/trace -> `graphify path`
   - concept/node explanation -> `graphify explain`
5. If corpus changed after graph build, recommend refresh via `memory-build` or `graphify --update`.
</process>

<rules>
- prefer graph retrieval over corpus reread
- do not hallucinate edges or freshness
- if graph answer weak, say so and recommend refresh or targeted source read
</rules>
