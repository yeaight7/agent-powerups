---
name: relay-gemini
description: Relay questions and tasks to a persistent local Gemini ACP session with cross-turn context.
---

# relay-gemini

Relay tasks to a persistent local Gemini ACP session. Gemini relay uses ACP and keeps cross-turn context across turns — use it when you need an ongoing advisory session, not a one-shot question.

Compatible with: `claude-code`, `codex`, `generic`

Requires:
- Local Gemini CLI (`gemini`)

## When to Use Relay vs Ask

| Situation | Use |
|-----------|-----|
| Multi-turn review or advisory dialogue | `relay` — context persists across turns |
| Long-running code review with follow-ups | `relay` — same session, same context |
| Single focused question, no follow-up needed | `ask-gemini` — simpler, no daemon |
| Quick brainstorm, one answer expected | `ask-gemini` — lighter weight |
| Cross-session context (resume days later) | `relay init` + `relay ask` with context.md |

## Workflow

```bash
# Start a named session (keeps running between asks)
apx relay start <name> --provider gemini

# Ask follow-up questions in the same session
apx relay ask <name> "<prompt>"

# Check session health
apx relay status <name>

# Stop when done
apx relay stop <name>
```

## Context Seeding

Initialise a session directory with a context file before starting:

```bash
apx relay init <name>
# Edit .apx/relay/<name>/context.md with repo background, goals, constraints
apx relay start <name> --provider gemini
apx relay ask <name> "Based on the context above, review this plan: ..."
```

## Artifacts

Each `relay ask` turn writes an artifact to `.apx/relay/<name>/gemini-turn-N-<slug>-<timestamp>.md`.
