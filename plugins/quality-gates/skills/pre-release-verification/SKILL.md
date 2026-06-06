---
name: pre-release-verification
description: Use when a release candidate needs final checks before tagging, publishing, or production deployment.
---

## Purpose

Block releases until the repository state, CI status, local validation, and publish metadata are known and reproducible.

## When to Use

- Before creating a release tag.
- Before deploying to production.
- Before approving a release candidate prepared by another agent.
- When CI is green but local package or catalog checks still need proof.

Do not use as a substitute for fixing failures. If any gate fails, stop and report the blocker.

## Inputs

- Intended version or deployment identifier
- Current branch and commit
- CI status for the release commit
- Project-specific build, lint, test, and packaging commands

## Workflow

1. Confirm the working tree is clean:

```bash
git status --short
```

2. Confirm the release commit and recent history:

```bash
git log --oneline --decorate -n 10
```

3. Confirm CI is green for the exact commit. For GitHub:

```bash
gh run list --limit 5
gh run view <run-id> --json conclusion,status,headSha,url
```

4. Run local validation. Use the project's documented commands, for example:

```bash
npm run build
npm test
python scripts/validate-skills.py
python scripts/validate-catalog.py
```

5. Check for secrets or accidental local files:

```bash
git diff --stat
git status --short
```

6. Report go/no-go with exact evidence.

## Output

```text
RELEASE VERIFICATION: go / no-go
Commit: <sha>
CI: <status and URL>
Local checks: <commands and results>
Blockers: <none or list>
Next action: <tag / deploy / stop>
```

## Verification

- [ ] Working tree was clean or dirty files were reported.
- [ ] CI status was tied to the exact release commit.
- [ ] Local validation commands exited 0.
- [ ] No secrets or accidental local files were included.
- [ ] Go/no-go recommendation included evidence, not confidence.

## Failure Modes

- Releasing from an uncommitted or untracked local state.
- Checking CI for a different commit than the release candidate.
- Treating lint/build success as full test coverage.
- Continuing after a failed gate because the release is "small".
