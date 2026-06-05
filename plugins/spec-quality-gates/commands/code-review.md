---
name: code-review
description: Review source files changed during a phase for bugs, security issues, and code quality problems
argument-hint: "<phase-number> [--depth=quick|standard|deep] [--files file1,file2,...]"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Write
  - Task
---

## Objective

Review source files changed during a phase for bugs, security vulnerabilities, and code quality problems.

Spawns the `structured-code-reviewer` agent to analyze code at the specified depth level. Produces `{padded_phase}-REVIEW.md` in the phase directory with severity-classified findings.

Arguments:
- Phase number (required) — which phase's changes to review (e.g., `2` or `02`)
- `--depth=quick|standard|deep` — review depth level (default: standard)
  - `quick`: Pattern-matching only (~2 min)
  - `standard`: Per-file analysis with language-specific checks (~5-15 min)
  - `deep`: Cross-file analysis including import graphs and call chains (~15-30 min)
- `--files file1,file2,...` — explicit comma-separated file list (highest precedence; skips SUMMARY/git scoping)

## Context

Phase: $ARGUMENTS (first positional argument is phase number)

Optional flags parsed from $ARGUMENTS:
- `--depth=VALUE` — depth override (quick|standard|deep)
- `--files=file1,file2,...` — explicit file list; when provided, skips SUMMARY.md extraction and git diff fallback entirely

## Process

**Step 1 — Validate Phase**

Resolve phase number to a phase directory under `.planning/phases/`. If not found, error with a list of available phases.

**Step 2 — Determine File Scope**

Priority order (highest first):
1. `--files` flag: use the provided list directly
2. Phase SUMMARY.md: parse the "Files Modified" section
3. Git diff fallback: `git diff --name-only HEAD~{plan_count}..HEAD -- src/` (approximate)

If no source files found after filtering, create REVIEW.md with `status: skipped` and exit.

**Step 3 — Filter Scope**

Exclude:
- `.planning/` directory contents
- Planning markdown files
- Lock files (`*.lock`, `package-lock.json`, `yarn.lock`)
- Generated files (`dist/`, `build/`, `*.min.js`, `*.d.ts`)

**Step 4 — Spawn Reviewer**

Spawn `structured-code-reviewer` agent with:
- `depth`: resolved depth level
- `phase_dir`: path to phase directory
- `review_path`: `{phase_dir}/{padded_phase}-REVIEW.md`
- `files`: filtered file list
- `CLAUDE.md`: path to project CLAUDE.md if it exists

**Step 5 — Present Results**

After reviewer completes, show an inline summary:
- Total findings by severity (Critical / Warning / Info)
- Top 3 most critical findings with file:line and fix hint
- Path to full REVIEW.md

## Success Criteria

- [ ] Phase validated and resolved to directory
- [ ] File scope determined (--files > SUMMARY.md > git fallback)
- [ ] Generated/planning files excluded from scope
- [ ] structured-code-reviewer spawned with correct config
- [ ] Inline summary presented to user
- [ ] REVIEW.md artifact created in phase directory
