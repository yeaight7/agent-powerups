# quality-gate-after-edit

**Type:** PostToolUse hook recipe — review before use, not auto-applied.

## Purpose

After writing or editing a source file, recommend the narrowest relevant validation command for that file's language or type. Catches misconfigured runs, wrong commands, or agents that skip validation entirely after edits.

This hook suggests; it does not run commands automatically. Running validation automatically on every edit would be too slow and disruptive in most workflows.

## Trigger Suggestion

```
PostToolUse → tool in [Write, Edit]
  AND target path matches a known source file pattern
```

## Matcher Patterns

Map file extensions to suggested validation commands:

| Extension / Path | Suggested command |
|---|---|
| `*.ts`, `*.tsx` | `tsc --noEmit` or project typecheck script |
| `*.py` | `pytest` / `ruff check` / `mypy` depending on config |
| `*.go` | `go test ./...` or `go vet ./...` |
| `*.rs` | `cargo check` or `cargo test` |
| `*.sql`, `models/**/*.sql`, `dbt/**` | `dbt parse` / `dbt test` / `dbt build --select` |
| `*.md` | optional: `markdownlint` / `vale` / spellcheck |
| `Makefile`, `*.mk` | `make --dry-run <target>` |
| `*.json`, `*.yaml`, `*.toml` | schema validation if configured |

## Behavior

When a source file is written or edited:

1. Print: `[quality-gate-after-edit] Edit detected: <file path>`
2. Look up the file extension and print the suggested command:

```
SUGGESTED VALIDATION:
  <command>

Run this before claiming the task is complete.
Narrow the scope where possible (e.g., test only the changed file or module).
```

3. If the agent has already run a matching validation command in the same session step: print a one-line confirmation and skip the prompt.
4. Warn only — do not run commands automatically or block the edit.

## Safe Default

Non-blocking recommendation. The hook prints a suggestion only. The agent or user decides when to run it.

Optional strict mode: block a Stop or completion claim if no validation command was run since the last edit.

## Blocking vs Warning Mode

- **Warning (recommended):** Print the suggested command; let the agent continue.
- **Blocking (optional):** Intercept Stop if the agent tries to claim completion without running any validation since the last edit.

## False-Positive Risks

- Config files (`.json`, `.yaml`) without schema validation — suggestion may not apply.
- Auto-generated files where running tests against the generated output is meaningless.
- Test files themselves — running the full suite on every test edit may be expensive.

Consider allowlisting `*.generated.*`, `dist/`, `build/`, and `node_modules/`.

## Bypass / Approval Mechanism

Agent explicitly states "validation not required for this change" (e.g., doc-only, comment-only edit). User confirms. In warning mode, no bypass is needed — the suggestion is advisory.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# Called with $TARGET_PATH set by the hook runner.

suggest_command() {
  local path="$1"
  case "$path" in
    *.ts|*.tsx)     echo "tsc --noEmit (or your project typecheck script)" ;;
    *.py)           echo "pytest -x (or ruff check / mypy as appropriate)" ;;
    *.go)           echo "go test ./... or go vet ./..." ;;
    *.rs)           echo "cargo check or cargo test" ;;
    *.sql)          echo "dbt parse or dbt test --select <model>" ;;
    *.md)           echo "markdownlint or vale (if configured)" ;;
    *)              exit 0 ;;
  esac
}

CMD=$(suggest_command "$TARGET_PATH")
if [ -n "$CMD" ]; then
  echo "[quality-gate-after-edit] Edit detected: $TARGET_PATH"
  echo "Suggested validation: $CMD"
fi

exit 0  # Warning only
```

## Sources / Inspiration

Language-specific validation patterns from project tooling guides. Complements `build-analysis-post` (which analyzes build output) and `typescript-post-edit-check` (TypeScript-specific specialized variant).
