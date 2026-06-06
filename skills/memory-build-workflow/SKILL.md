---
name: memory-build-workflow
description: Use when a user needs to build or refresh persistent graph memory from a mixed corpus and the right path may include graphify, incremental update, or helper conversion before ingestion.
---

# Memory Build Workflow

## Overview

Build persistent graph memory with `graphify`.

Use helper tools only when source format would otherwise reduce graph quality or waste context.

## When to Use

- first graph build for a repo, notes folder, research corpus, or mixed raw folder
- corpus changed enough that persistent graph memory is worth refreshing
- input includes PDFs, Office docs, or noisy web pages that should be normalized before graph build
- user wants durable graph outputs instead of one-shot file reading

Do not use for:
- one small plain-text file or a narrow one-off question
- cases where an existing graph already answers the question better via query

## Required Checks

```powershell
apx check graphify
apx check markitdown-file-intake
apx check defuddle
```

Stop and report missing tools. Do not auto-install without approval.

## Routing

| Situation | Action |
|---|---|
| ready local corpus of readable files | run `graphify` |
| existing graph plus changed sources | run `graphify --update` |
| PDF, Office doc, slide deck, or similar hard-to-read format | convert with `markitdown-file-intake`, then build with `graphify` |
| article or noisy web page | clean with `defuddle`, then build with `graphify` |
| user wants vault browsing after build | offer optional Obsidian export |

## Core Rules

- `graphify` is the primary engine
- prefer `graphify --update` over full rebuild when a graph already exists
- use helpers only to improve source readability before graph ingestion
- keep Obsidian optional and post-build
- keep source provenance intact when converting inputs

## Minimal Workflow

1. Check whether a usable graph already exists.
2. If it exists and sources changed, prefer `graphify --update`.
3. If sources are noisy or binary, normalize them with the narrowest helper.
4. Build or refresh with `graphify`.
5. Offer query workflow next instead of rereading the corpus.

## Common Failure Modes

- missing `graphify`: stop and report; no fallback build path
- rebuilding from scratch when update would work: unnecessary cost and churn
- using helpers on already-readable Markdown or code: wasted step
- treating Obsidian as required: wrong; it is optional output only

## Verification

- [ ] Required tool checks ran; missing tools were reported, not auto-installed
- [ ] An existing usable graph was checked for before any build
- [ ] Incremental update was preferred over full rebuild when a graph existed
- [ ] Helpers were used only on sources that would otherwise degrade graph quality
- [ ] Source provenance survived any conversion; Obsidian was offered, never assumed

## References

- [`../graphify/UPSTREAM.md`](../graphify/UPSTREAM.md)
- [`../../references/HELPER_TOOLS.md`](../../references/HELPER_TOOLS.md)
- [`../../references/OBSIDIAN_EXPORT.md`](../../references/OBSIDIAN_EXPORT.md)
