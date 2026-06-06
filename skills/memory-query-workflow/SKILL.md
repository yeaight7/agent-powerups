---
name: memory-query-workflow
description: Use when a graph already exists and the user needs retrieval, tracing, explanation, or gap detection from graph memory before reopening the full corpus.
---

# Memory Query Workflow

## Overview

Use existing graph memory first.

Query the graph before rereading source files unless the graph is missing, stale, or too weak for the question.

## Required Check

```powershell
apx check graphify
```

## Required State

- existing `graphify-out/graph.json`

## Routing

| Question shape | Action |
|---|---|
| broad question about connected concepts | `graphify query` |
| trace between two concepts, files, or systems | `graphify path` |
| explain one concept or node in context | `graphify explain` |
| no graph exists | switch to `memory-build-workflow` |
| graph exists but corpus changed | recommend `graphify --update` before trusting results |

## Core Rules

- prefer graph retrieval over full-corpus reread
- say explicitly when the graph is missing, stale, sparse, or weakly matched
- do not overclaim beyond what graph nodes and edges support
- when graph coverage is weak, use the graph result to target the next direct read instead of restarting broad exploration

## Minimal Workflow

1. Confirm `graphify-out/graph.json` exists.
2. Choose `query`, `path`, or `explain` based on question shape.
3. Answer from graph evidence first.
4. If result quality is weak, say why: missing graph, stale graph, low coverage, or weak node match.
5. Escalate to build/update or targeted reread only when needed.

## Common Failure Modes

- skipping graph lookup and rereading everything
- hiding that the graph is stale or incomplete
- using `query` for a question that clearly needs a path trace
- treating no-result output as proof the corpus lacks the concept

## Verification

- [ ] Graph existence was confirmed before any query ran
- [ ] The command matched the question shape: query for breadth, path for traces, explain for one node
- [ ] The answer is grounded in graph nodes and edges — no overclaiming
- [ ] Staleness, sparseness, or weak node matches were stated explicitly
- [ ] Escalation to build, update, or targeted reread happened only when graph evidence was insufficient

## Reference

- [`../graphify/UPSTREAM.md`](../graphify/UPSTREAM.md)
