---
name: agent-session-forensics
description: Use when diagnosing agent session history, interrupted tool loops, missing tool results, timing bottlenecks, or subagent trace correlation.
---

# Agent Session Forensics

## When To Use
- Agent session ended mid-tool-call or cannot resume.
- Tool call appears in assistant turn but no corresponding result turn follows.
- Need to correlate tool calls, tool results, and timing metadata.
- Diagnosing slow LLM calls, duplicate user turns, or malformed results.
- Debugging experimental MCP data-layer sessions.

## Requirements / Checks
- Locate session directory and history files before editing anything.
- Prefer read-only inspection first.
- Have `jq` or equivalent JSON tooling available.
- Ask before modifying, truncating, or deleting any session or history file.

## Workflow

1. **Inventory session files** — find metadata, current history, rotated previous history, and related subagent histories.

2. **Count and list last turns**:
   ```sh
   jq 'length' history.json                                      # total messages
   jq '.[-10:] | .[] | {role, stop_reason}' history.json        # last 10 turns
   jq '.[] | select(.role=="assistant") | .tool_calls[].id' history.json  # tool call IDs
   jq '.[] | select(.role=="user") | .tool_results[]?.tool_call_id' history.json  # results
   ```

3. **Correlate tool call IDs** — every `tool_call` in an assistant turn must have a matching `tool_result` in the immediately following user turn. Find the first gap.

4. **Check timing for slow calls**:
   ```sh
   jq '.[] | select(.timing) | {role, duration_ms: .timing.duration_ms}' history.json
   ```

5. **Identify failure pattern** — see table below.

6. **Repair (if approved)** — write a backup first (`cp history.json history.json.bak`), then make the smallest possible fix at the last valid correlation boundary.

## Common Failure Patterns

| Symptom | Likely cause | Repair |
|---|---|---|
| Tool call with no result turn | Session interrupted mid-tool | Truncate after last matched pair |
| Two consecutive user turns | Duplicate message insertion | Remove the duplicate |
| `tool_result` with no prior `tool_call` | Corrupted or manually edited history | Remove orphan result |
| Empty `content` on assistant turn | Model returned no text + no tools | Usually safe to truncate |
| Session loops without progress | Missing result causes re-prompt | Inject minimal synthetic result |

## Safety Constraints
- Do not edit session JSON without backing up the original first.
- Treat history files as sensitive: prompts, tool arguments, credentials, and file contents may appear.
- Do not infer user intent from stale history when current user instructions conflict.
- Do not repair by deleting broad ranges — find the last valid tool-call/result correlation boundary.

## Validation / Done Criteria
- Report the names of every session file inspected.
- Every tool-call ID is accounted for (matched or flagged as unmatched).
- Any proposed repair names the backup path and truncation boundary.
- No session file is mutated without explicit user approval.

## References
- `references/history-diagnostics.md`
