# memory-optimization

Graph-backed memory and context optimization bundle with `graphify` as the primary engine and document-conversion helpers used only when they reduce noise or reread cost.

What this bundle is for:
- deciding when to read directly vs build/query graph memory
- normalizing awkward source formats before graph work
- building, refreshing, and querying reusable memory over mixed corpora

Bundle layout:
- `skills/`: reusable workflow instructions for build, query, optimization, and helper-tool intake
- `commands/`: command-first entrypoints for common memory actions
- `agents/`: specialist prompts that route toward the cheapest useful memory path
- `references/`: short notes on provenance, helper usage, and optional Obsidian export

Working stance:
- `graphify` is the default long-lived memory path
- `markitdown-file-intake` and `defuddle` are helpers, not the center of the bundle
- direct reading is still valid for small, already-readable corpora
- Obsidian is optional output, never a prerequisite

Operating rules:
- inspect the relevant local bundle files before acting
- check requirements before runnable steps, typically with `apx check ...`
- do not auto-install tools, mutate global config, or write secrets without explicit approval
- prefer graph query or `graphify --update` over rebuilding when a usable graph already exists
- keep provenance clear: this bundle ships guidance and prompts, not vendored upstream tool code

Start points:
- use `commands/memory-optimize.md` when the main question is "what is the cheapest path?"
- use `commands/memory-build.md` when reusable graph memory should be created or refreshed
- use `commands/memory-query.md` when `graphify-out/graph.json` already exists and the user wants answers from the graph
