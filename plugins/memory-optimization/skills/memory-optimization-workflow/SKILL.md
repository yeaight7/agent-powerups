---
name: memory-optimization-workflow
description: Use when deciding the cheapest context path across direct reading, markdown conversion, graph build, incremental update, or graph query for mixed corpora.
---

# Memory Optimization Workflow

Minimize token spend and reread cost.

Fast routing:
- small plain-text corpus -> read directly
- PDF / Office docs -> `markitdown`
- noisy web pages -> `defuddle`
- repeated questions across same corpus -> `graphify`
- existing graph + changed sources -> `graphify --update`
- existing graph + new question -> graph query first

Checks:

```powershell
apx check graphify
apx check markitdown-file-intake
apx check defuddle
```

Rules:
- prefer Markdown over binary/doc formats
- prefer graph memory over full rereads
- stop and report missing tools

References:
- [`../../references/HELPER_TOOLS.md`](../../references/HELPER_TOOLS.md)
- [`../../references/GRAPHIFY_PROVENANCE.md`](../../references/GRAPHIFY_PROVENANCE.md)
