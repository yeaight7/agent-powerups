---
name: doc-consistency-check
description: "Audit documentation for broken file paths, outdated commands, and renamed variables."
---

# Doc Consistency Check

Documentation rots when code changes. This skill identifies stale references in Markdown files.

## Consistency Protocol

1. Grep markdown files (`.md`) for file paths (e.g., `src/components/Button.tsx`).
2. Verify that those files still exist in the repository. If not, the documentation is stale.
3. Check code blocks in documentation. Do the function names and variable names still match the actual source code?
4. Flag broken links and outdated references for immediate correction.