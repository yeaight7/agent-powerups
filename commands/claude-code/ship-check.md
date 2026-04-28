# ship-check

Use this before final handoff.

Steps:

1. Read the active plan or user request.
2. Inspect changes with `git status --short` and `git diff --check`.
3. Run targeted tests for changed behavior. For this repo, CLI/catalog changes usually require `npm test`.
4. If assets changed, run:
   - `python scripts/validate-skills.py`
   - `python scripts/validate-catalog.py`
   - `python scripts/check-requirements.py`
5. Final response must include changed files, commands run, validation results, and remaining risks.

Do not commit, push, install tools, or mutate global agent config unless explicitly requested.
