---
name: release-readiness-protocol
description: Check version bump, changelog, compare range, package metadata, validation commands, publish steps, and rollback plan before cutting a release.
---

# Release Readiness Protocol

Use before tagging, publishing, or promoting a release. Goal: confirm the release is correct and reversible before any external write.

## When to Use

- Cutting a new version of a library, CLI, or service
- Before `git tag`, `npm publish`, `gh release create`, or equivalent
- When release steps span multiple systems or targets
- When you need a structured go/no-go before triggering CD

## Inputs

- Intended version number (or bump type: `patch`, `minor`, `major`)
- Current default branch state
- Changelog or release notes draft
- Known compare range (from last tag or SHA)
- Publish targets (npm, PyPI, Docker, GitHub Releases, etc.)

## Workflow

### 1. Version check

- Read current version from package.json, pyproject.toml, Cargo.toml, or the relevant manifest
- Confirm the bump type matches the change set (breaking change → major, new feature → minor, fix → patch)
- Verify the version does not already exist in the registry:
  ```
  npm view <pkg>@<version>      # npm
  pip index versions <pkg>      # PyPI
  cargo search <pkg>            # crates.io
  ```

### 2. Compare range and change summary

Run `git log <last-tag>..HEAD --oneline --no-merges` and categorize:

| Commit type | Release impact |
| --- | --- |
| `feat` / new capability | Minor or higher |
| `fix` / bug fix | Patch |
| `BREAKING CHANGE` / `!` suffix | Major — must be documented |
| `chore`, `ci`, `refactor` | No user impact |

Flag any breaking changes that are not yet in the changelog.

### 3. Metadata check

- `README` reflects current behavior (no stale CLI flags or API references)
- All required manifest fields present: `description`, `license`, `homepage`, `repository`
- No placeholder or TODO text in published fields
- Verify what will be published: `.npmignore` / `files` / `publish.include`

### 4. Validation gate

Run the full suite. All must pass before tagging:

```bash
npm test          # or pytest, cargo test, etc.
tsc --noEmit      # type check (if applicable)
npm run lint      # or equivalent
npm run build     # confirm artifact builds cleanly
```

Do not release from a failing suite.

### 5. Publish plan

Write the exact commands in sequence before executing any of them:

```bash
git tag vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
npm publish --access public      (or equivalent)
gh release create vX.Y.Z --notes-file CHANGELOG.md
```

Present this plan and wait for explicit approval before running step 1.

### 6. Rollback plan

Define rollback for each step before executing:

| Step | Rollback |
| --- | --- |
| git tag | `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z` |
| npm publish | `npm deprecate <pkg>@<ver> "released in error"` (most registries do not allow deletion after 24h) |
| GitHub Release | `gh release delete vX.Y.Z --yes` |

Document rollback before the first irreversible step.

## Output

```
RELEASE READINESS: go / no-go

Version: X.Y.Z  (bump type: patch/minor/major)
Compare range: <last-tag>..HEAD — N commits
Changelog coverage: complete / missing entries for [list]
Breaking changes flagged: yes / no
Validation: tests PASS/FAIL  types PASS/FAIL  lint PASS/FAIL  build PASS/FAIL
Publish plan: [step list]
Rollback plan: [step list]

BLOCKERS:
  - [item]

PROCEED? (yes/no)
```

Wait for explicit "yes" before executing any tag or publish step.

## Verification

- Version does not already exist in the target registry
- All validation commands exit 0
- Changelog covers every user-visible commit in the compare range
- Rollback plan is documented before the first irreversible step

## Failure Modes

- Releasing from a dirty working tree — run `git status --short` first
- Version already published — bump again or use a pre-release tag
- Changelog out of sync — re-run the compare range check
- Missing rollback plan — do not proceed past step 2 without one

## Sources / Inspiration

Inspired by `Yeachan-Heo/oh-my-codex` (RELEASE_PROTOCOL.md). Rewritten in Agent Powerups style.
