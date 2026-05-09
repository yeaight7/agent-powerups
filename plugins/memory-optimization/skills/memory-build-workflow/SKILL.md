---
name: memory-build-workflow
description: Use when building or refreshing a graph-backed memory corpus from mixed local files, web pages, or converted documents with graphify as the primary engine.
---

# Memory Build Workflow

Build persistent graph-backed memory with `graphify`. Use helper tools only to normalize hard-to-read sources before graph build.

Required checks:

```powershell
apx check graphify
apx check markitdown-file-intake
apx check defuddle
```

Routing:
- ready local corpus of code/docs/notes/images -> `graphify`
- existing graph + changed corpus -> `graphify --update`
- PDF / Office docs -> `markitdown` first when direct input would be noisy
- web page / article -> `defuddle` first when HTML chrome would waste tokens
- optional vault output -> Obsidian export after graph build

Rules:
- `graphify` primary, helpers secondary
- stop if required tool missing
- prefer update over rebuild

References:
- [`../graphify/UPSTREAM.md`](../graphify/UPSTREAM.md)
- [`../../references/HELPER_TOOLS.md`](../../references/HELPER_TOOLS.md)
- [`../../references/OBSIDIAN_EXPORT.md`](../../references/OBSIDIAN_EXPORT.md)
