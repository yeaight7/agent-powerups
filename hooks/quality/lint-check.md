# lint-check

**Type:** PreToolUse hook recipe — review before use, not auto-applied.

## Purpose

Enforce code style and static analysis checks before the agent completes work or commits. Catches formatting violations, unused imports, type errors (where applicable), and other issues that linters surface but tests miss.

## Trigger Suggestion

```
PreToolUse → tool == Bash AND command contains "git commit"
Stop → always run (optional, lighter version)
```

## Check Procedure

When triggered on a commit attempt:

1. **Detect the linter** — check for common configs: `.eslintrc*`, `biome.json`, `.ruff.toml`, `pyproject.toml [tool.ruff]`, `golangci-lint.yml`, `clippy` (Rust).
2. **Run the linter** — capture exit code and error count.
3. **If exit code 0** — allow the commit to proceed.
4. **If exit code non-zero** — print lint errors, block the commit, ask agent to fix before retrying.

## Suggested Shell Hook

```bash
#!/usr/bin/env bash
set -euo pipefail

if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ]; then
  npx eslint . --max-warnings 0 || { echo "[lint-check] ESLint errors. Fix before committing."; exit 1; }
elif [ -f "biome.json" ]; then
  npx biome check . || { echo "[lint-check] Biome errors. Fix before committing."; exit 1; }
elif [ -f "pyproject.toml" ] && grep -q "ruff" pyproject.toml 2>/dev/null; then
  ruff check . || { echo "[lint-check] Ruff errors. Fix before committing."; exit 1; }
elif [ -f "Cargo.toml" ]; then
  cargo clippy -- -D warnings || { echo "[lint-check] Clippy errors. Fix before committing."; exit 1; }
else
  echo "[lint-check] No known linter config found. Skipping."
fi
```

## Safety Notes

- Use `--max-warnings 0` or `-D warnings` to treat warnings as errors in CI-facing hooks.
- For projects with a pre-commit config (`.pre-commit-config.yaml`), run `pre-commit run --all-files` instead of per-tool commands.
- Don't silence linter output — the agent needs to see the specific errors to fix them.

## Failure Mode

Without this hook, agents can commit code that passes tests but fails lint, leading to CI failures that block other contributors.
