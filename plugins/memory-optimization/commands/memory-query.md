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

<context>
Input: a user question, node name, or relationship target from `$ARGUMENTS`.

Expected state:
- `graphify-out/graph.json` already exists for the target corpus
- `graphify` is available for query, path, or explain flows
</context>

<process>
1. Check `apx check graphify`.
2. Confirm `graphify-out/graph.json` exists before answering from graph memory.
3. If `graphify` is missing, stop and report the missing requirement. If the graph file is missing, stop and route to `memory-build`.
4. Route the request to one primary flow:
   - broad question, topic lookup, or "what do we know about X?" -> `graphify query`
   - relationship trace, dependency chain, or "how does X connect to Y?" -> `graphify path`
   - concept/node explanation or "explain X" -> `graphify explain`
5. Check freshness before leaning on the answer:
   - if the corpus changed after the graph was built, say the graph may be stale
   - recommend `memory-build` or `graphify --update` before treating the answer as current
6. If the graph answer is weak, partial, or clearly off-route, say so explicitly and recommend either refresh or targeted source reread.
</process>

<stop_conditions>
- `graphify` requirement check fails
- `graphify-out/graph.json` does not exist
- user is asking for current corpus state but the graph is known stale enough that the answer would mislead
- query intent is ambiguous enough that query/path/explain routing would likely choose the wrong flow
</stop_conditions>

<rules>
- prefer graph retrieval over corpus reread
- do not hallucinate edges, nodes, or freshness
- do not silently fall back to full-corpus reread unless the user asked for it or graph retrieval is unusable
- if graph answer is weak, say so and recommend refresh or targeted source read
- `graphify query` is default only for broad retrieval; use `path` and `explain` when the question shape is narrower
</rules>
