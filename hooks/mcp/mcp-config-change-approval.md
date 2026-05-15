# mcp-config-change-approval

**Type:** PreToolUse hook recipe — review before use, not auto-applied.

## Purpose

Require explicit approval before any operation that modifies MCP server configuration files. Unauthorized MCP config changes can silently redirect tool calls to a different server, introduce a malicious server, or remove safety guardrails.

## Trigger Suggestion

```
PreToolUse → tool in [Write, Edit, Bash]
  AND target path OR command involves MCP config files
```

## Matcher Patterns

Flag operations on:

| File pattern | Notes |
|---|---|
| `.mcp.json` | Claude Code MCP config |
| `config.toml` | Codex MCP config (only the `[mcp_servers.*]` sections) |
| `*.mcp.json` | Named MCP config files |
| `mcp/*.json` or `mcp/*.toml` | Config files in the `mcp/` directory |
| `.cursor/mcp.json` | Cursor MCP config |
| `GEMINI.md` (MCP sections) | Gemini CLI MCP config |

Also flag Bash commands that use `jq`, `sed`, or `tee` to modify these files.

## Behavior

When a flagged operation is detected:

1. Print: `[mcp-config-change-approval] MCP configuration change detected:`
2. Show: the target path and the proposed change (new server entry, modification, or deletion).
3. State the effect: "This will add/modify/remove MCP server: `<server-name>`."
4. Halt until explicit user confirmation.

## Safe Default

Block all MCP config changes without explicit approval. Show the exact diff before asking.

## Blocking vs Warning Mode

- **Blocking (recommended):** Halt and require approval. MCP config changes are high-trust operations.
- **Warning:** Inappropriate — MCP config changes have too much blast radius for warning-only mode.

## False-Positive Risks

- Automated MCP install scripts that the user has intentionally run (e.g., `apx mcp install`).
- CI pipelines that generate or update MCP configs from templates.

## Bypass / Approval Mechanism

User provides an explicit "yes" after reviewing the exact proposed change. The hook should show a diff or the new entry content before asking, not just the file path.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# Called with $TARGET_PATH and optionally $PROPOSED_CONTENT set by the hook runner.

MCP_CONFIG_PATTERNS=("\.mcp\.json$" "config\.toml$")

for pattern in "${MCP_CONFIG_PATTERNS[@]}"; do
  if echo "$TARGET_PATH" | grep -qE "$pattern"; then
    echo "[mcp-config-change-approval] MCP configuration change detected:"
    echo "  File: $TARGET_PATH"
    if [ -n "$PROPOSED_CONTENT" ]; then
      echo "  Proposed content:"
      echo "$PROPOSED_CONTENT" | head -30
    fi
    echo "Approve this MCP config change? (explicit yes required)"
    exit 1
  fi
done

exit 0
```

## Sources / Inspiration

- Claude Code settings and MCP configuration documentation.
- Security Model documentation in this repository (`docs/security-model.md`).
