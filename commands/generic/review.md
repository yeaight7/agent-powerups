# review

Purpose: Systematic code review that surfaces correctness, test coverage, and style issues.

1. Obtain the diff for the changes under review.
2. Read each changed file — not just the diff, the full context.
3. Check correctness: does the logic satisfy the requirements? Edge cases?
4. Check tests: do tests cover the new behavior? Run the test suite.
5. Check style: naming, duplication, dead code, misleading comments.
6. Report findings: what is correct, what must change, what is a suggestion.

Do not merge, commit, or modify files during review.
