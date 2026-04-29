---
name: relay-gemini
description: Relay questions and tasks to a persistent local Gemini ACP session with cross-turn context.
---

# relay-gemini

Relay tasks to a persistent local Gemini ACP session. Gemini relay uses ACP and keeps cross-turn context.

Compatible with: `claude-code`, `codex`, `generic`

Requires:
- Local Gemini CLI (`gemini`)

## Workflow

```bash
apx relay start <name> --provider gemini
apx relay ask <name> "<prompt>"
apx relay stop <name>
```
