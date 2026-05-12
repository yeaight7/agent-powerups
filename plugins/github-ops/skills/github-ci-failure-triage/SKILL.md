---
name: github-ci-failure-triage
description: Inspect GitHub PR checks, fetch actionable failure logs, summarize the breakage, and propose a local fix plan before changing code.
---

# GitHub CI Failure Triage

Use this skill when a PR is red and you need a clean readout before editing anything.

## Core Rules

- Resolve the PR first
- Inspect failing checks before guessing
- Prefer GitHub-native data (`gh` or a GitHub connector) over screenshots or copied snippets
- Summarize the failure before proposing code changes
- Implement only after approval when the task is framed as triage-first
- Do not auto-commit, auto-push, or auto-rerun remote writes without approval

## Workflow

1. **Resolve the PR**
   - Use the provided PR number or URL
   - Otherwise resolve the PR from the current branch

2. **Inspect failing checks**
   - List checks and isolate failing GitHub Actions jobs
   - Pull the relevant run metadata and logs
   - If a check is external, report the URL and keep it out of local log parsing

3. **Summarize the failure**
   - failing job
   - likely root cause
   - relevant log snippet
   - affected files or subsystem

4. **Propose the fix plan**
   - what to change locally
   - what to validate locally first
   - what remains remote-only

5. **Implement only when the user wants the fix**
   - keep changes traceable to the failing signal
   - rerun the narrowest meaningful local validation first

## Bundled Helper

- `scripts/inspect_pr_checks.py`

Use it when you want a structured check summary instead of raw `gh` output.
