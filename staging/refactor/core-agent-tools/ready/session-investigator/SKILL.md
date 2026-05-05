---
name: session-investigator
description: Use when diagnosing agent session history, tool-call loops, interrupted runs, missing tool results, timing bottlenecks, or subagent trace correlation.
---

# Session Investigator

## When To Use
- Agent session ended mid-tool-call or cannot resume.
- Need to correlate tool calls, tool results, and timing metadata.
- Need to inspect subagent usage, message rate, slow calls, or duplicate user turns.
- Debugging experimental MCP data-layer sessions.

## Requirements / Checks
- Locate session dir and history files before editing anything.
- Prefer read-only inspection first.
- Use `jq` or equivalent JSON tooling if available.
- Ask before modifying, truncating, or deleting any session/history file.

## Workflow
1. Inventory session files: metadata, current history, rotated previous history, and related subagent histories.
2. Count messages and list last turns with role, stop reason, tool calls, and tool results.
3. Correlate tool call IDs from assistant turns to following user tool result records.
4. Check timing channels for slow LLM calls and slow tools.
5. Identify common failure patterns: unanswered tool call, duplicate user message, malformed result, interrupted session.
6. If repair is requested, write a backup first and make the smallest truncation or metadata fix.

## Safety Constraints
- Do not edit session JSON before making a backup.
- Treat history files as sensitive: prompts, tool args, secrets, and file contents may appear inside.
- Do not infer user intent from stale history if current user instructions conflict.
- Do not repair by deleting broad ranges; find the last valid correlation boundary.

## Validation / Done Criteria
- Report includes exact session files inspected.
- Tool-call/result pairing is accounted for.
- Any proposed repair names the backup path and truncation boundary.
- No session mutation occurs without explicit user approval.

## References
- `references/history-diagnostics.md`
