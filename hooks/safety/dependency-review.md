# dependency-review

**Type:** PreToolUse hook recipe — review before use, not auto-applied.

## Purpose

Catch new package additions before they land. When an agent edits `package.json`, `requirements.txt`, `pyproject.toml`, `Cargo.toml`, `go.mod`, or equivalent dependency manifests, pause and audit the change for known malicious packages, unexpected version ranges, and supply-chain risk.

## Trigger Suggestion

Run on any Write or Edit tool call that touches a dependency manifest. Suggested event pattern:

```
PreToolUse → file path matches: **/package.json, **/requirements*.txt, **/pyproject.toml, **/Cargo.toml, **/go.mod
```

## Check Procedure

When triggered, perform these checks before allowing the write:

1. **Identify the diff** — which packages are being added, upgraded, or removed.
2. **Check for typosquats** — compare package names against known legitimate packages. Flag anything suspiciously similar (`requuests`, `lodahs`, `couldflare`).
3. **Verify version range** — loose ranges (`*`, `>=0.0.0`) in production dependencies are a red flag.
4. **Confirm necessity** — does the new dependency solve a problem that couldn't be covered by an existing dep?
5. **Report before proceeding** — show the diff and findings, ask the user to confirm before allowing the write.

## Suggested Shell Hook (Node example)

```bash
#!/usr/bin/env bash
# Reads the file being written from CLAUDE_TOOL_INPUT_PATH env var (set by hook runner)
FILE="${CLAUDE_TOOL_INPUT_PATH:-}"
if [[ "$FILE" == *"package.json"* ]]; then
  echo "[dependency-review] package.json is being modified. Review the diff before accepting."
  # npm audit can run after write; consider adding it to PostToolUse instead
fi
```

## Safety Notes

- Do not auto-reject — dependency updates are normal. Gate on information, not assumption.
- Flag, don't block by default; the user decides.
- Combine with `npm audit`, `pip-audit`, or `cargo audit` in a PostToolUse hook for full vulnerability scanning after the write.

## Failure Mode

If this hook is not in place, new malicious or misconfigured packages can enter the project silently during an agentic session that edits multiple files.
