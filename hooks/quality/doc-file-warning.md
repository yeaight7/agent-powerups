# doc-file-warning

**Type:** PreToolUse / PostToolUse hook recipe — review before use, not auto-applied.

## Purpose

Warn when agents write Markdown or plain-text files to the repository root or to directories outside approved documentation locations. Prevents documentation sprawl where agents drop notes, summaries, and draft files in arbitrary places.

This is distinct from `generated-file-warning`, which targets auto-generated code artifacts. This hook targets prose/doc files specifically.

## Trigger Suggestion

```
PreToolUse → tool in [Write]
  AND target path matches documentation file pattern
  AND path is not in an approved documentation directory
```

## Matcher Patterns

Flag writes to:

| Pattern | Condition |
|---|---|
| `*.md` | At repo root or in non-approved directories |
| `*.txt` | At repo root or in non-approved directories |
| `*.rst` | At repo root or in non-approved directories |
| `notes/` | Informal notes directories |
| `tmp/`, `scratch/` | Temporary directories |
| `.agent-*` | Agent working files outside `.gitignore` control |

**Approved locations** (do not flag):

| Path | Reason |
|---|---|
| `docs/` | Standard documentation directory |
| `README.md` (root) | Standard root file |
| `CHANGELOG.md` (root) | Standard root file |
| `CONTRIBUTING.md` (root) | Standard root file |
| `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` (root) | Agent instruction files |
| `LICENSE`, `SECURITY.md` (root) | Standard root files |
| `**/README.md` | Per-directory README |

## Behavior

When a write to a flagged path is detected:

1. Print: `[doc-file-warning] Documentation file written outside approved location:`
2. Show the target path.
3. Print the suggestion:

```
Consider placing documentation files in an approved location:
  docs/           — general documentation
  README.md       — module or directory overview
  CHANGELOG.md    — change history
  CONTRIBUTING.md — contribution guide

If this file is intentional, add it to an allowlist or approved path list.
If it is temporary, add it to .gitignore.
```

4. Warn only — do not block the write.

## Safe Default

Warning only. Writing to unexpected paths is often intentional. Hard blocking would interfere with legitimate working files, scratch notes, and context files during active work.

## Blocking vs Warning Mode

- **Warning (recommended):** Print location suggestion; allow the write.
- **Blocking:** Use only if your team has a strict policy against ad-hoc doc files in the repo root or random directories.

## False-Positive Risks

- Repos that legitimately store docs at root level (monorepos with per-package READMEs at arbitrary paths).
- Migration guides or release notes with non-standard names.
- Generated changelogs written to root as part of a release workflow.

Consider allowlisting paths matched by project-specific patterns.

## Bypass / Approval Mechanism

User explicitly confirms the write location is intentional. The agent acknowledges the warning and proceeds. No hard approval gate is required in warning mode.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# Called with $TARGET_PATH set by the hook runner.

APPROVED_PATTERNS=(
  "^docs/"
  "^README\.md$"
  "^CHANGELOG\.md$"
  "^CONTRIBUTING\.md$"
  "^AGENTS\.md$"
  "^CLAUDE\.md$"
  "^GEMINI\.md$"
  "^LICENSE"
  "^SECURITY\.md$"
  ".*/README\.md$"
)

DOC_PATTERNS=(
  "\.md$"
  "\.txt$"
  "\.rst$"
)

is_doc=false
for pattern in "${DOC_PATTERNS[@]}"; do
  if echo "$TARGET_PATH" | grep -qE "$pattern"; then
    is_doc=true
    break
  fi
done

if ! $is_doc; then
  exit 0
fi

for pattern in "${APPROVED_PATTERNS[@]}"; do
  if echo "$TARGET_PATH" | grep -qE "$pattern"; then
    exit 0
  fi
done

echo "[doc-file-warning] Documentation file outside approved location: $TARGET_PATH"
echo "Consider: docs/, README.md, CHANGELOG.md, CONTRIBUTING.md, or a per-directory README."
echo "If intentional, add to an allowlist or .gitignore."
exit 0  # Warning only
```

## Sources / Inspiration

Documentation hygiene practices from monorepo governance guides. Distinct from `generated-file-warning` (code artifacts) and focused on prose/documentation sprawl prevention.
