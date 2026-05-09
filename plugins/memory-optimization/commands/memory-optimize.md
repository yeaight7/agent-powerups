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

<process>
1. Inspect input shape: plain text, web page, PDF/Office docs, mixed corpus, existing graph.
2. Check:
   - `apx check graphify`
   - `apx check markitdown-file-intake`
   - `apx check defuddle`
3. Recommend one primary path:
   - direct read
   - `defuddle` -> Markdown -> read/build
   - `markitdown` -> Markdown -> read/build
   - `graphify` full build
   - `graphify --update`
   - graph query against existing graph
4. Explain why path is cheaper in token cost, reread cost, or persistence.
5. Include exact next command(s) and fallback when requirement missing.
</process>

<rules>
- optimization target = lower token cost, lower reread cost, better persistence
- `graphify` is long-lived memory path
- helpers are normalization tools only
- do not claim bundled upstream code
</rules>
