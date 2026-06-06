---
name: agent-harness-design
description: Use when designing tool definitions for a new agent or subagent, an agent shows high retry rates, ambiguous tool invocations, or silent failures, or an existing agent harness needs a quality review.
---

# Agent Harness Design

Use when designing or improving how an agent invokes tools, handles errors, and decides when to stop.

## Tool Design Rules

- **Names**: explicit and stable (`read_file`, `run_tests`); no generic names (`do_action`, `execute`)
- **Schemas**: required fields only; enum values for modes; reject invalid input with a clear error
- **Output**: always include `status` (success/warning/error), `summary`, `next_actions`, `artifacts`
- **Catch-all tools**: avoid `run_bash`/`shell_exec` unless task is genuinely open-ended; add allowlist

## Error Path Rules

| Case | Required response |
|------|------------------|
| Invalid input | Reject immediately with exact field name |
| Transient failure | Include `retry_after` hint and idempotency note |
| Non-recoverable | Set `stop: true`, describe manual resolution |

## Retry and Stop Conditions

Define in harness, not inside tools:
- Max retries: 2
- Hard stops: `status: "error"` with `stop: true`; same inputs called twice in a row

## Granularity Guide

| Risk | Granularity |
|------|------------|
| High (deploy, migrate, permissions) | Micro — one action, explicit confirmation |
| Medium (edit, read, search) | Standard composite |
| Low (format, list, report) | Macro batch acceptable |

## Context Budget

- Keep system prompt fixed and minimal
- Load large guidance from skills on demand
- Compact at phase boundaries, not mid-task

## Verification

- [ ] Every tool has an explicit, stable name and exactly one distinct operation
- [ ] Schemas use required fields and enums — no free-text mode strings, no behavior-changing optionals
- [ ] Every tool response carries `status`, `summary`, `next_actions`, and `artifacts`
- [ ] Every tool defines its invalid-input, transient-failure, and non-recoverable paths
- [ ] Retry ceiling and stop conditions are declared in the harness, not inside tools
- [ ] Any catch-all tool is documented with its risk and guarded by an allowlist or preflight check
