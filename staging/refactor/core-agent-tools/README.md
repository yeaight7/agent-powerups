# Core Agent Tools - Refactor Drafts

**DRAFT: requires review before catalog/plugin activation.**

This directory contains raw drafts.
These are **not yet shipped**, not in `catalog.json`, and must stay excluded from npm package output.

## Process
1. Raw unpolished drafts have been placed into staging directory.
2. Concepts were rewritten and polished into ship-ready assets under `staging/ready/`.
3. Once polished and tested locally, approved assets can be moved to root `skills/`, `mcp/`, or `plugins/` and registered in catalog metadata.

## Files
- `metadata.json` maps new items, proposed root skills, proposed bundles, and existing bundle duplication.
- `COVERAGE_MATRIX.md` shows coverage, including docs, subfolders and references.
- `REFactor_PLAN.md` records shipping sequence and blockers.
- `drafts/**` contains draft skill/docs content only.
- `drafts/*/references/*.md` contains support material worth preserving for shipping review.

## Current Boundary
Do not move these drafts into shipped locations in this pass. Next pass should pick specific assets from `metadata.json`, then update shipped files and validators together.

## Support File Rule
Support files are intentionally selective. They preserve concrete checklists, tool models, templates, and failure diagnostics that would bloat `SKILL.md` if kept inline.
