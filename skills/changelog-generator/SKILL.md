---
name: changelog-generator
description: Use when preparing release notes or a changelog entry from commits, PRs, or diffs, summarizing a sprint or version range, or scanning a range for breaking changes before publishing.
---

# Changelog Generator

## When to Use

- Preparing release notes for a GitHub Release or CHANGELOG.md entry
- Summarizing changes across a sprint, milestone, or version range
- Checking whether any commits contain breaking changes before publishing
- Producing a technical diff summary for internal reviewers

## Inputs

- Compare range: `<from-tag>..HEAD`, `main..HEAD`, or a PR list with merge dates
- Target audience and output mode (see below)
- Existing CHANGELOG.md (if present, match its format)

## Workflow

### 1. Collect raw material

```bash
git log <from>..<to> --oneline --no-merges
git log <from>..<to> --format="%h %s (%an)" --no-merges
```

Or from GitHub PRs:
```bash
gh pr list --state merged --base main --json number,title,labels,author
```

Check CHANGELOG.md for format precedent before writing.

### 2. Classify commits

| Commit signal | User-facing label |
|---|---|
| `feat` / new capability | Added |
| `fix` / bug fix | Fixed |
| `perf` / performance | Improved |
| `deprecate` | Deprecated |
| `BREAKING CHANGE:` footer or `!` suffix | **Breaking** |
| `chore`, `refactor`, `ci`, `build` | (internal — omit from user notes) |
| `docs` | Include only if docs are a shipped artifact |

When Conventional Commits are not used, infer from the commit subject.

### 3. Scan for breaking changes

Flag any commit or PR that:
- Contains `BREAKING CHANGE:` in the message body
- Has a `!` suffix on the type (e.g., `feat!: rename --output-dir`)
- Removes or renames a public export, CLI flag, API endpoint, or config key
- Changes a default value or behavior

### 4. Write the output

**User-facing release notes** (GitHub Release body):

```markdown
## What's Changed

### Added
- Description of new capability ([#123](link))

### Fixed
- Description of bug fix ([#124](link))

### Breaking Changes
- `--old-flag` has been renamed to `--new-flag` — update your scripts

### Deprecated
- `legacyMethod()` is deprecated; use `newMethod()` instead
```

**Internal changelog entry** (CHANGELOG.md format):

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
### Fixed
### Changed
### Breaking
### Deprecated
### Chores
```

**Breaking-change scan only:**

```
BREAKING CHANGES FOUND:
  abc1234 feat!: rename --output-dir to --out
  def5678 fix: remove deprecated --legacy flag

NONE if clean.
```

**Technical diff summary** (for internal reviewers):

```
CHANGED FILES: N
MODULES AFFECTED: [list]
SUMMARY: [what changed at the file/module level, no prose]
```

## Output

Deliver the formatted block plus:
- Compare range used
- Total commit count in range
- Any commits skipped (merge commits, reverts, etc.)

## Verification

- Every user-visible commit in the range is covered
- Breaking changes are explicitly labeled in user-facing output
- No internal chore commits appear in user-facing release notes

## Failure Modes

- Empty compare range — run `git log <from>..<to>` to confirm the range resolves correctly
- Conventional Commits not used — fall back to inferred classification from the subject line
- Squash-merge strategy with uninformative subjects — use PR titles and labels instead

## Sources / Inspiration

Inspired by `ComposioHQ/awesome-codex-skills` `changelog-generator/SKILL.md`. Rewritten in Agent Powerups style.
