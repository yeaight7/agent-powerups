---
name: pre-release-verification
description: "Use before tagging a release or deploying to production to ensure all quality gates have passed."
---

# Pre-Release Verification

Releases must be deterministic and verified. No "hope driven" deployments.

## Verification Checklist

Before authorizing or participating in a release process, verify the following:

1. **Clean Working Tree**: `git status` must be completely clean. No untracked files or uncommitted changes.
2. **Green CI**: The latest commit on the main branch MUST have a passing CI pipeline.
3. **Lint & Types**: Run the project's linter (`npm run lint`, `cargo clippy`, etc.) and type checker (`tsc --noEmit`). They must exit with 0.
4. **Test Gate**: Run the full test suite locally if CI is not available or if requested.
5. **No Secrets**: Ensure no API keys or credentials have been accidentally hardcoded or staged.

If any check fails, the release is blocked. State the exact failure and stop.