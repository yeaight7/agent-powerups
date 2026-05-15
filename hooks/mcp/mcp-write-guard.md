# mcp-write-guard

**Type:** PreToolUse hook recipe — review before use, not auto-applied.

## Purpose

Intercept MCP tool calls that perform write operations (create file, delete file, push code, post message, update record) and require explicit user approval before they execute. Prevents autonomous remote writes driven by a misconfigured agent loop.

## Trigger Suggestion

```
PreToolUse → tool matches mcp__*
  AND tool name contains write / create / delete / update / push / send / post / merge
```

Or more narrowly, enumerate the specific write tools exposed by each MCP server the project uses.

## Matcher: Write-Class Tool Names

Flag calls to tools matching these patterns (case-insensitive):

| Pattern | Example tools |
|---|---|
| `*__create_*` | `mcp__github__create_pull_request`, `mcp__notion__create_page` |
| `*__update_*` | `mcp__github__update_pull_request`, `mcp__linear__update_issue` |
| `*__delete_*` | `mcp__github__delete_file`, `mcp__notion__delete_block` |
| `*__push_*` | `mcp__github__push_files` |
| `*__merge_*` | `mcp__github__merge_pull_request` |
| `*__send_*` | `mcp__slack__send_message` |
| `*__write_*` | `mcp__filesystem__write_file` |
| `*__add_*` | `mcp__github__add_issue_comment` |

Read-only tools (`*__list_*`, `*__get_*`, `*__search_*`, `*__read_*`) are not matched.

## Behavior

When a flagged write tool is detected:

1. Print: `[mcp-write-guard] MCP write operation intercepted:`
2. Show: tool name, target (e.g., repo, channel, file path), and arguments.
3. State: "This will make a change in an external system. Approve?"
4. Halt until explicit user confirmation.

## Safe Default

Block all MCP write calls by default; require per-call approval.

## Blocking vs Warning Mode

- **Blocking (recommended):** Halt and require explicit approval for every write.
- **Warning:** Log the write and proceed — only acceptable for low-stakes, local MCP servers (e.g., filesystem on a throwaway directory).

## False-Positive Risks

- `create_` tool names that are read-adjacent (e.g., `create_branch` from a draft state). Evaluate per MCP server.
- Automated workflows that legitimately chain write calls — if the user has consented to an autonomous flow, disable this guard for that session.

## Bypass / Approval Mechanism

User provides an explicit "yes" or the agent re-invokes with a user-provided approval token. The hook must not infer approval from a general instruction like "do it all" — require per-write acknowledgment unless the user explicitly switches the guard off.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# Called with $TOOL_NAME and $TOOL_ARGS set by the hook runner.

WRITE_PATTERNS=(
  "__create_" "__update_" "__delete_" "__push_"
  "__merge_" "__send_" "__write_" "__add_"
)

for pattern in "${WRITE_PATTERNS[@]}"; do
  if echo "$TOOL_NAME" | grep -qi "$pattern"; then
    echo "[mcp-write-guard] MCP write operation intercepted:"
    echo "  Tool: $TOOL_NAME"
    echo "  Args: $TOOL_ARGS"
    echo "This will modify an external system. Approve? (explicit yes required)"
    exit 1
  fi
done

exit 0
```

## Sources / Inspiration

- Claude Code PreToolUse hook documentation.
- MCP tool naming conventions from `modelcontextprotocol/servers` and various MCP server implementations.
