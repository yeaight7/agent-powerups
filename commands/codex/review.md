# review

Use to perform a structured code review before merging or handing off.

Steps:

1. Get the diff: `git diff main...HEAD` or `git log --oneline main..HEAD`.
2. Read each changed file in full — diff context alone is insufficient.
3. Check correctness: does the logic match the stated intent? Are edge cases handled?
4. Check tests: are new behaviors covered? Run the repo's test command if test files changed.
5. Check style: naming, duplication, comment hygiene.
6. Run `apx validate catalog` if catalog.json or asset files changed.
7. Write findings: what is correct, what needs fixing, what is optional.

Do not commit, push, or modify files during review unless explicitly asked.
