# Core Agent Tools - Refactored Assets

This directory preserves the refactored staging trace for the core agent-tool skills.
Shipped copies live in root `skills/` and selected plugin bundles.
This staging area must stay excluded from npm package output.

## Process
1. Raw unpolished material was written into `staging/`.
2. Refactored copies were parked under `ready/` for review.
3. Shipping copies were mirrored into root `skills/` and plugin bundles, then registered in catalog metadata.

## Files
- `ready/**` contains refactored staging copies.
- `ready/*/references/*.md` contains support material preserved for audit and future edits.

## Current Boundary
Shipped copies are the source of truth for runtime use.
Use staging only as review trace; do not register staging paths in catalogs or plugin manifests.

## Support File Rule
Support files are intentionally selective. They preserve concrete checklists, tool models, templates, and failure diagnostics that would bloat `SKILL.md` if kept inline.
