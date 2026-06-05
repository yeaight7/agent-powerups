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

## Objective

Build persistent graph-backed memory for a corpus. `graphify` is primary engine. `defuddle` and `markitdown` are preprocessing helpers only.

## Context

Inputs:
- target path from `$ARGUMENTS`, default `.` when omitted
- `--update` to refresh an existing graph instead of rebuilding from scratch
- `--obsidian` only when the user explicitly wants vault-style navigation

Expected outputs:
- `graphify-out/graph.json`
- updated graph report or other `graphify-out/` artifacts from the graphify workflow
- optional `graphify-out/obsidian/` only when `--obsidian` was requested

## Process

1. Resolve target path. Default to current directory. Confirm it exists before any tool invocation.
2. Check requirements:
   - `apx check graphify`
   - `apx check markitdown-file-intake`
   - `apx check defuddle`
3. If `graphify` is missing, stop immediately. Report the missing requirement and point to `apx check graphify --install-missing --dry-run`. Do not continue with helper-only output.
4. Inspect the corpus and choose one primary route:
   - ready docs/code/notes/images -> run `graphify` directly
   - web-heavy HTML/docs -> use `defuddle` first only if HTML chrome would pollute the graph
   - PDF/Office docs -> use `markitdown-file-intake` first only if direct input would be noisy or unreadable
   - mixed corpus -> normalize only the noisy subsets, then hand the corpus to `graphify`
5. Decide build mode:
   - if `graphify-out/graph.json` already exists, prefer update flow
   - if user passed `--update`, use update flow even if only part of the corpus changed
   - if no graph exists yet, run a fresh build
6. Keep Obsidian optional:
   - if `--obsidian` was requested, include Obsidian export in the graphify run
   - otherwise do not add vault generation by default
7. Report what happened:
   - chosen route
   - requirement status
   - whether this was fresh build or update
   - exact next step if the build was blocked

## Stop Conditions

- target path does not exist or is clearly the wrong scope
- `graphify` requirement check fails
- no supported or readable source material is found after inspection
- helper conversion is needed for source quality, but the required helper is missing
- user asked for `--update` but there is no existing graph to update; switch to fresh build only if the user intent still clearly fits

## Rules

- `graphify` is always the primary product and final engine
- helpers are normalization tools, not substitutes for graph build
- never pretend a build, refresh, or export succeeded when requirements are missing
- prefer update over rebuild when an existing graph can be preserved
- do not require Obsidian for successful completion
- when a helper is missing, fall back to direct `graphify` only if source quality is still acceptable; otherwise stop and say why
- cite `skills/graphify/UPSTREAM.md`, `references/HELPER_TOOLS.md`, and `references/OBSIDIAN_EXPORT.md`
