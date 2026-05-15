# changelog

Use to generate release notes or a CHANGELOG.md entry from a commit range.

Steps:

1. Confirm the compare range: `git log <from>..<to> --oneline --no-merges`.
2. Check `CHANGELOG.md` for the existing format to match.
3. Classify commits: Added, Fixed, Breaking, Improved, Deprecated, or Internal.
4. Omit chore/ci/refactor commits from user-facing output.
5. Flag breaking changes explicitly in a dedicated section.
6. Format the output in the requested mode: release notes, CHANGELOG entry, or breaking-change scan.

Do not commit or modify files unless explicitly asked.
