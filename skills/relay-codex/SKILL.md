---
name: relay-codex
description: Relay questions and tasks to a local Codex CLI using one-shot subprocesses per ask.
---

# relay-codex

Relay tasks to a local Codex CLI. Codex relay uses `codex` per ask. There is no cross-turn memory.

Note that `codex` may open an interactive TUI on some versions. For non-interactive relay, you might need to use `--full-auto` manually if supported, though it is not the safe default.

Compatible with: `claude-code`, `gemini-cli`, `generic`

Requires:
- Local Codex CLI (`codex`)

## Workflow

```bash
apx relay start <name> --provider codex
apx relay ask <name> "<prompt>"
apx relay stop <name>
```
