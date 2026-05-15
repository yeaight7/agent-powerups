# changelog

Purpose: Generate user-facing release notes or an internal changelog from commits, PRs, or a diff.

1. Confirm the compare range (e.g., `v1.2.3..HEAD`, `main..HEAD`, or a date-bounded PR list).
2. Run: `git log <from>..<to> --oneline --no-merges`.
3. Classify each commit: Added, Fixed, Breaking, Improved, Deprecated, or Internal.
4. Omit chore/ci/refactor/build commits from user-facing output.
5. Flag breaking changes explicitly — they must be visible, not buried.
6. Format output in the requested mode: release notes, CHANGELOG entry, or breaking-change scan only.
7. Confirm all user-visible commits in the range are covered.

Do not commit or modify CHANGELOG.md unless explicitly asked.
