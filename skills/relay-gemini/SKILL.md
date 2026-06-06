---
name: relay-gemini
description: Use when a persistent local Gemini ACP session should keep context across multiple advisory turns.
---

## Purpose

Use Gemini through Agent Powerups relay for multi-turn advisory work where context continuity matters more than one-shot speed.

Compatible with: `claude-code`, `codex`, `generic`

Requires:

- Local Gemini CLI (`gemini`)

## When to Use

| Situation | Use |
| --- | --- |
| Multi-turn review or advisory dialogue | `relay` - context persists across turns |
| Long-running code review with follow-ups | `relay` - same session, same context |
| Single focused question, no follow-up needed | `ask-gemini` - simpler, no daemon |
| Quick brainstorm, one answer expected | `ask-gemini` - lighter weight |
| Cross-session context | `relay init` + `relay ask` with context file |

Do not use relay when a single `ask-gemini` turn would be enough.

## Inputs

- Relay session name
- Optional seeded context file
- Focused question or review prompt
- Stop condition for the advisory loop

## Workflow

1. Verify Gemini is available:

```bash
gemini --version
```

2. Create a context file when the session needs durable background:

```bash
apx relay init <name>
```

3. Start the session:

```bash
apx relay start <name> --provider gemini
```

4. Ask follow-up questions in the same session:

```bash
apx relay ask <name> "<prompt>"
```

5. Check session health when a turn fails or times out:

```bash
apx relay status <name>
```

6. Stop the session when the advisory loop is complete:

```bash
apx relay stop <name>
```

## Output

- Per-turn artifacts under the relay session directory
- A short decision log of accepted/rejected advice
- Explicit follow-up prompts when additional context is needed

## Verification

- [ ] Gemini CLI was available or missing CLI was reported.
- [ ] Persistent context was needed; otherwise `ask-gemini` was preferred.
- [ ] Context file was reviewed before relying on it.
- [ ] Each artifact was read before acting on the advice.
- [ ] Session was stopped or intentionally left running.

## Failure Modes

- Using relay for cheap one-off questions.
- Letting stale context steer later answers.
- Forgetting to stop long-running relay sessions.
- Treating Gemini advice as validated code review without checking source and tests.
