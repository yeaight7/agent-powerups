---
name: agent-harness-design
description: Design agent tool sets with stable names, narrow schemas, deterministic output shapes, and explicit error paths. No catch-all tools unless unavoidable.
---

# Agent Harness Design

Use when designing or improving how an agent invokes tools, handles errors, and decides when to stop.

## When to Use

- Designing tool definitions for a new agent or subagent
- Observing high retry rates or ambiguous tool invocations
- Agent is failing silently or completing without verifying outcomes
- Reviewing an existing agent harness for quality issues

## Tool Design Rules

### Naming

- Use explicit, stable names: `read_file`, `run_tests`, `apply_patch`
- No generic names: `do_action`, `execute`, `handle`
- One tool per distinct operation; do not overload parameters to compensate

### Schema

Keep tool inputs narrow:
- Required fields only; no optional fields that change behavior
- Use enums for mode/type values — never free-text strings that require parsing
- Validate at the boundary; reject malformed input with a clear error, not a fallback

```json
{
  "name": "run_tests",
  "parameters": {
    "path": { "type": "string", "description": "Path to test file or directory" },
    "filter": { "type": "string", "description": "Optional test name filter" }
  }
}
```

### Output Shape

Every tool response must include:
- `status`: `"success" | "warning" | "error"`
- `summary`: one-line result (human-readable)
- `next_actions`: list of follow-up steps the agent should consider
- `artifacts`: file paths or IDs produced (empty list if none)

### Catch-All Tools

Avoid `run_bash` / `shell_exec` style catch-all tools unless:
- The task is genuinely open-ended and the toolset cannot be pre-defined
- You explicitly document the risk and add an allowlist or preflight check

If you must use a catch-all, add a PreToolUse validation hook for dangerous patterns.

## Error Path Rules

Every tool must define what happens on failure:

| Case | Required response |
|------|------------------|
| Invalid input | Reject immediately with `status: "error"` and exact field name |
| Transient failure | Include `retry_after` hint and idempotency note |
| Non-recoverable | State `stop: true` and describe the manual resolution step |

Do not return partial success with no indication that something failed.

## Retry and Stop Conditions

Define retry limits in the harness, not inside tool implementations:

```
max_retries: 2
stop_conditions:
  - tool returns status: "error" with stop: true
  - same tool called with identical inputs twice in a row
  - completion signal received
```

Never retry indefinitely. Declare a hard ceiling.

## Context Budget

- Keep system prompt fixed and minimal — it is loaded on every turn
- Put large reference material (schemas, docs) in skills loaded on demand
- Compact at phase boundaries (after research, after planning, after debugging)
- Do not pass growing tool-call history to subagents; summarize into a context bundle

## Granularity Guide

| Risk level | Tool granularity |
|------------|-----------------|
| High (deploy, migrate, permissions) | Micro — one action, one confirmation |
| Medium (edit, read, search) | Standard — composite is fine |
| Low (format, report, list) | Macro — batch operations acceptable |

## Benchmarks to Track

- Completion rate (task finished without escalation)
- Retries per task
- Pass@1 rate (completed on first attempt)
- Cost per successful task

## Anti-Patterns

- Overlapping tool semantics (agent cannot choose between them)
- Tool returns only on error — no output on success
- No explicit stop condition — agent loops indefinitely
- Context overload — every tool call inlines full file contents
