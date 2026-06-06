---
name: github-ci-failure-triage
description: Use when a GitHub PR shows failing checks and a clean failure readout is needed before changing any code.
---

## Purpose

Produce a clean, GitHub-native readout of failing PR checks before any code is edited. Triage first: summarize the breakage and propose a local fix plan; implement only after approval when the task is framed as triage-first.

## When to Use

- A PR is red and the cause is unknown
- The user asks why CI is failing before asking for a fix
- A triage-first readout must precede any code edits

## Inputs

- The PR number or URL (or the current branch to resolve it from)
- `gh` CLI authenticated for the repository, or a GitHub connector

## Core Rules

- Resolve the PR first
- Inspect failing checks before guessing
- Prefer GitHub-native data (`gh` or a GitHub connector) over screenshots or copied snippets
- Summarize the failure before proposing code changes
- Implement only after approval when the task is framed as triage-first
- Do not auto-commit, auto-push, or auto-rerun remote writes without approval

## Workflow

1. **Resolve the PR:**

   ```bash
   gh pr view <number-or-url> --json number,title,headRefName,url
   gh pr view --json number,title,headRefName,url    # from the current branch
   ```

2. **Inspect failing checks.** List checks, isolate failing GitHub Actions jobs, and pull only the failing logs:

   ```bash
   gh pr checks <number>
   gh run list --branch <head-branch> --limit 10
   gh run view <run-id> --json jobs        # job-level status
   gh run view <run-id> --log-failed       # logs from failing steps only
   ```

   If a check is external (not GitHub Actions), report its URL and keep it out of local log parsing.

3. **Summarize the failure:**
   - failing job
   - likely root cause
   - relevant log snippet
   - affected files or subsystem

4. **Propose the fix plan:**
   - what to change locally
   - what to validate locally first
   - what remains remote-only

5. **Implement only when the user wants the fix.** Keep changes traceable to the failing signal; rerun the narrowest meaningful local validation first.

## Bundled Helper

- `scripts/inspect_pr_checks.py` — use it when you want a structured check summary instead of raw `gh` output.

## Output

- Failing job(s) with a root-cause hypothesis and the minimal relevant log snippet
- Affected files or subsystem
- A local fix plan with validation steps, separated from remote-only actions

## Verification

- [ ] PR resolved explicitly (number/URL or current branch)
- [ ] Failure evidence pulled from GitHub-native data, not screenshots or pasted snippets
- [ ] Log excerpt limited to the failing step, not the whole run log
- [ ] Summary written before any code change was proposed
- [ ] No remote writes (commit/push/rerun) performed without approval

## Failure Modes

- **Guess-first triage** — proposing fixes before reading the failing job's log.
- **Log dumping** — pasting entire run logs instead of `--log-failed` output for the failing step.
- **Unapproved remote writes** — rerunning workflows or pushing while the task was triage-first.
- **Parsing external checks locally** — non-Actions checks only expose a URL; report it instead.
