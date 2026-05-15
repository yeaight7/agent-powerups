---
name: agent-runtime-patterns
description: Use when optimizing agent runtime loops, card packs, MCP session lifecycle, tool-call count, or multi-agent orchestration patterns.
---

# Agent Runtime Patterns

## When to use
- Optimizing a slow or over-spending agent loop (too many tool calls, high token use).
- Designing multi-agent orchestration topology for a new workflow.
- Managing MCP session lifecycle for experimental data-layer sessions.
- Reducing redundant search or file-read loops.

## Core Patterns

| Pattern | Use when | Avoid when |
|---|---|---|
| **Direct execution** | Single agent, clear scope, no subagent benefits | Task genuinely requires parallel sub-agents or specialized routing |
| **Routing** | Input type determines which specialized agent to invoke | Agents share context and can't be isolated |
| **Chaining** | Output of A is strict input of B | Agents need to share partial context |
| **Orchestrator-worker** | Parallel independent subtasks with a coordinator | Tasks are tightly coupled or sequential |
| **Agents-as-tools** | Callable child agent inside a parent's tool loop | The child needs user interaction |

## Knowledge Cards

A **card** is a compact, high-signal instruction block — typically 3–10 lines — for a specific operation. Cards are preferable to loading full documentation into context.

Good card: step sequence + key constraint + example invocation.
Bad card: copied README sections, multiple unrelated topics in one block.

Pack cards for the current task only. Swap cards between phases rather than accumulating them.

## Workflow

1. **Identify the bottleneck** — measure before optimizing: count tool calls, token usage, and latency. Name the specific slow or expensive step.
2. **Choose the right pattern** — use the table above. Default to direct execution; add orchestration only when simpler approaches are insufficient.
3. **Pack knowledge as cards** — replace large prompt docs with targeted 5–10 line cards per operation.
4. **Bound search loops** — cap retries (e.g., max 3 search attempts), normalize query construction, prefer a dedicated search subagent over inline ad-hoc loops.
5. **Model MCP sessions explicitly** — for experimental sessions: track create/delete lifecycle, request `_meta` session IDs, handle missing-session errors without silent retries.
6. **Measure after** — compare latency, tool-call count, token use, and task success rate before/after.

## Safety Constraints
- Sandbox experimental runtime changes; do not deploy to production flows without verified before/after comparison.
- Do not add orchestration layers to compensate for unclear requirements — clarify the task first.
- Do not persist session state containing secrets without an explicit storage policy.
- Do not retry failed sessions silently; surface the error.

## Validation / Done Criteria
- Measurable before/after evidence: fewer tool calls, lower latency, lower token use, or higher task success.
- Chosen orchestration pattern is named and justified.
- Session lifecycle and cleanup behavior are documented if MCP sessions were introduced.

## References
- `references/runtime-patterns.md`
