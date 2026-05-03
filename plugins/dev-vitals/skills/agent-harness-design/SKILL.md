---
name: agent-harness-design
description: Design agent tool sets with stable names, narrow schemas, deterministic output shapes, and explicit error paths. No catch-all tools unless unavoidable.
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
