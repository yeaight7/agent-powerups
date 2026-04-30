# review

Use to perform a structured code review before merging or handing off.

Steps:

1. Get the diff: `git diff main...HEAD` or `gh pr diff <PR-number>`.
2. Read each changed file in full — don't review from diff context alone.
3. Check correctness: does the logic match the stated intent? Are there edge cases unhandled?
4. Check tests: are new behaviors covered? Run `npm test` (or the repo's test command) if tests changed.
5. Check style: naming, duplication, comment hygiene.
6. Run `apx validate catalog` if catalog.json or asset files changed.
7. Write findings as a short list: what's correct, what needs fixing, what's optional.

Do not commit, push, or approve PRs from within this workflow.
