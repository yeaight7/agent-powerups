---
name: relay-claude
description: Relay questions and tasks to a local Claude CLI using one-shot subprocesses per ask.
---

# relay-claude

Relay tasks to a local Claude CLI. Claude relay uses `claude -p` per ask. There is no cross-turn memory.

Compatible with: `codex`, `gemini-cli`, `generic`

Requires:
- Local Claude Code CLI (`claude`)

## Workflow

```bash
apx relay start <name> --provider claude
apx relay ask <name> "<prompt>"
apx relay stop <name>
```
