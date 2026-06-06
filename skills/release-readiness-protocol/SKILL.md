---
name: release-readiness-protocol
description: Use when preparing a versioned release and release metadata, validation, publish commands, and rollback plan must be checked before tagging.
---

## Purpose

Confirm a release is correct, documented, validated, publishable, and reversible before any external write such as a tag push, package publish, or GitHub release.

## When to Use

- Cutting a new version of a library, CLI, or service.
- Before `git tag`, `npm publish`, `gh release create`, or equivalent.
- When release steps span multiple systems or targets.
- When a release needs a go/no-go decision with rollback steps.

## Inputs

- Intended version number or bump type
- Current package metadata
- Last release tag or compare base
- Changelog or release notes draft
- Publish target such as npm, PyPI, Docker, or GitHub Releases

## Workflow

### 1. Version check

Read the current version from the relevant manifest and verify the target does not already exist:

```bash
npm view <pkg>@<version> version
pip index versions <pkg>
cargo search <pkg>
```

Confirm bump type:

- Breaking change -> major
- New user-facing capability -> minor
- Bug fix, catalog/doc correction, or asset polish -> patch

### 2. Compare range and change summary

```bash
git describe --tags --abbrev=0
git log <last-tag>..HEAD --oneline --no-merges
git diff --stat <last-tag>..HEAD
```

Flag breaking changes, release-note gaps, and user-visible assets that changed.

### 3. Metadata check

- README reflects current behavior.
- Manifest fields include description, license, homepage, repository, files, and publish config.
- No placeholder or TODO text appears in published metadata.
- Package contents match catalog paths.

For npm packages:

```bash
npm pack --dry-run
```

### 4. Validation gate

Run the full release suite for the project:

```bash
npm test
npm run build
python scripts/validate-skills.py
python scripts/validate-catalog.py
```

If a repository has a release preflight command, prefer it:

```bash
npm run release:check
```

### 5. Publish plan

Write exact commands before executing them:

```bash
git tag vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
npm publish --access public
gh release create vX.Y.Z --verify-tag --title "vX.Y.Z" --notes-file <notes>
```

Wait for explicit approval before the first irreversible step.

### 6. Rollback plan

| Step | Rollback |
| --- | --- |
| local tag | `git tag -d vX.Y.Z` |
| pushed tag | `git push origin :refs/tags/vX.Y.Z` |
| npm publish | `npm deprecate <pkg>@<ver> "released in error"` |
| GitHub Release | `gh release delete vX.Y.Z --yes` |

## Output

```text
RELEASE READINESS: go / no-go
Version: X.Y.Z
Compare range: <last-tag>..HEAD
Changelog coverage: complete / gaps
Breaking changes: yes / no
Validation: <commands and result>
Publish plan: <exact commands>
Rollback plan: <exact commands>
Blockers: <none or list>
```

## Verification

- [ ] Version does not already exist in the target registry.
- [ ] Compare range was reviewed.
- [ ] Changelog or release notes cover user-visible changes.
- [ ] Release validation commands exited 0.
- [ ] Package contents were checked when publishing a package.
- [ ] Rollback plan was written before tag or publish actions.

## Failure Modes

- Releasing from a dirty working tree.
- Tagging a version already published.
- Trusting generated release notes without checking the compare range.
- Running publish commands before rollback is documented.
- Treating a GitHub Release as proof that package publishing succeeded.
