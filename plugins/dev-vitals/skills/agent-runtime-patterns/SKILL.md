---
name: agent-runtime-patterns
description: Use when optimizing agent runtime loops, card packs, MCP session lifecycle, tool-call count, or multi-agent orchestration patterns.
---

# Agent Runtime Patterns

## When to use
Use when designing efficient agent runtimes, implementing "smart card" style prompt packs, or experimenting with novel MCP session management.

## Requirements / Checks
- Applies when optimizing an agent's execution loop, card packs, MCP server usage, or session handling.
- Treat agent runtime/session concepts as experimental until validated locally.
- Check whether existing Agent Powerups skills already cover the workflow before creating new runtime abstractions.

## Workflow
1. **Analyze bottleneck**: Identify redundant search loops, bloated prompts, serial subagent calls, or slow MCP tools.
2. **Pack knowledge**: Use compact "cards" for high-signal instructions; avoid bundling full docs unless needed.
3. **Bound search loops**: Prefer a tool-only search subagent or hook that normalizes search calls and caps retries.
4. **Compose agents carefully**: Use routing, chaining, orchestrator-worker, or agents-as-tools only when simpler direct execution is insufficient.
5. **Model sessions explicitly**: For experimental MCP sessions, track create/delete lifecycle, request `_meta` session IDs, and missing-session errors.
6. **Measure before/after**: Compare latency, tool count, token use, and task quality.

## Safety Constraints
- Experimental features must be sandboxed.
- Do not apply unproven runtime optimizations to critical production flows without verification.
- Do not add runtime layers to hide unclear requirements; simplify task design first.
- Do not persist session state that contains secrets without explicit storage policy.

## Validation / Done Criteria
- Before/after evidence shows lower latency, fewer tool calls, lower token use, or higher task success.
- Session lifecycle and cleanup behavior are documented.

## References
- `references/runtime-patterns.md`
