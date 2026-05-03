---
description: Run formatter, linter, and type checks for a file or directory. Report remediation steps.
---

# /quality-gate — Quality Pipeline

Run format, lint, and type checks on demand. Mirror the checks that CI would run.

## Usage

`/quality-gate [path|.] [--fix] [--strict]`

- Default target: current directory (`.`)
- `--fix`: apply auto-fixable issues (format, import order)
- `--strict`: fail on warnings as well as errors

## Pipeline

1. **Detect tooling** — infer language and tools from project config (`package.json`, `pyproject.toml`, etc.)
2. **Format check** — run formatter in check mode (`prettier --check`, `ruff format --check`, `gofmt -l`)
3. **Lint / type check** — run linter and type checker (`eslint`, `tsc --noEmit`, `mypy`, `clippy`)
4. **Report** — list failing checks with file, line, and fix instruction

## Output Format

```
Quality Gate — <path>

Formatter: PASS / FAIL (<N> issues)
Linter:    PASS / FAIL (<N> issues)
Types:     PASS / FAIL (<N> issues)

Remediation:
  <file>:<line> — <message>
  Fix: <exact command or change>
```

Return exit 0 only when all checks pass (or `--strict` warnings are absent).

## Notes

- Does not commit, push, or modify files unless `--fix` is passed
- When `--fix` is used, reports what was changed

## Arguments

$ARGUMENTS:
- `[path|.]` — target path or directory (default: `.`)
- `--fix` — apply auto-fixes
- `--strict` — treat warnings as failures
