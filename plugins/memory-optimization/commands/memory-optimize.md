---
name: memory-optimize
description: Choose the cheapest context path across direct read, markdown conversion, graph build, graph update, or graph query.
argument-hint: "[path-or-url] [question]"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
---

<objective>
Recommend the cheapest memory workflow that preserves answer quality and future reuse.
</objective>

<context>
Inputs:
- optional path or URL
- optional question or task goal

Optimization targets:
- lower token cost now
- lower reread cost later
- better persistence when repeated queries are likely
</context>

<process>
1. Inspect input shape and reuse horizon:
   - plain text or small local file
   - noisy web page
   - PDF/Office doc or other hard-to-read binary-ish source
   - mixed corpus
   - existing graph with new question
   - existing graph with changed sources
2. Check requirements:
   - `apx check graphify`
   - `apx check markitdown-file-intake`
   - `apx check defuddle`
3. Recommend exactly one primary path:
   - direct read for small, simple, one-shot text
   - `defuddle` -> Markdown -> read or build when web chrome is the main problem
   - `markitdown-file-intake` -> Markdown -> read or build when document format is the main problem
   - `graphify` full build when repeated questions or relationship navigation justify persistent memory
   - `graphify --update` when a graph already exists and sources changed
   - graph query against existing graph when the graph exists and the task is retrieval, tracing, or explanation
4. State why that path is cheapest:
   - lower immediate token cost
   - lower repeated reread cost
   - better persistence across future sessions
5. Include exact next command(s) for the recommended path.
6. If a required tool for the best path is missing, either:
   - recommend the next-best lower-capability path that still preserves answer quality, or
   - stop and say the missing requirement makes the cheap path unavailable
</process>

<stop_conditions>
- input is too ambiguous to choose between direct read, helper conversion, build, update, or query
- the recommended path depends on a missing tool and no credible fallback preserves answer quality
- user asks for persistent graph advice but the target path or URL is unavailable
</stop_conditions>

<rules>
- optimization target = lower token cost, lower reread cost, better persistence
- `graphify` is long-lived memory path
- helpers are normalization tools only
- keep `graphify` primary for persistent memory, helpers secondary, Obsidian optional
- do not recommend a graph build for trivial one-shot text when direct read is cheaper
- do not claim a helper or graph path is available before requirement checks pass
- do not claim bundled upstream code
</rules>
