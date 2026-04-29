---
name: relay-codex
description: Relay questions and tasks to a local Codex CLI using one-shot subprocesses per ask.
---

# relay-codex

Relay tasks to a local Codex CLI. Codex relay uses `codex --full-auto` per ask. There is no cross-turn memory.

Note that `codex --full-auto` may not exist on older Codex versions.

Compatible with: `claude-code`, `gemini-cli`, `generic`

Requires:
- Local Codex CLI (`codex`)

## Workflow

```bash
apx relay start <name> --provider codex
apx relay ask <name> "<prompt>"
apx relay stop <name>
```
