---
name: memory-build
description: Build or refresh graph-backed memory for a corpus, using graphify first and helper conversions only when they improve corpus quality.
argument-hint: "[path] [--update] [--obsidian]"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
---

<objective>
Build persistent graph-backed memory for a corpus. `graphify` is primary engine. `defuddle` and `markitdown` are preprocessing helpers only.
</objective>

<process>
1. Resolve target path. Default to current directory.
2. Check:
   - `apx check graphify`
   - `apx check markitdown-file-intake`
   - `apx check defuddle`
3. If `graphify` missing, stop. Surface install path.
4. Inspect corpus mix:
   - web-heavy HTML/docs -> `defuddle` first
   - PDF/Office docs -> `markitdown` first when source readability is poor
   - ready docs/code/images -> route straight to `graphify`
5. If `graphify-out/graph.json` exists or user passed `--update`, prefer `graphify --update`.
6. If user asked for Obsidian or recurring navigation clearly benefits, mention optional Obsidian export after graph build.
</process>

<rules>
- helpers are never primary product
- never pretend build succeeded when requirements missing
- prefer update over rebuild
- cite `skills/graphify/UPSTREAM.md`, `references/HELPER_TOOLS.md`, `references/OBSIDIAN_EXPORT.md`
</rules>
