---
name: relay-claude
description: Use when another local agent needs a one-shot Claude CLI answer without cross-turn relay memory.
---

## Purpose

Send a bounded prompt to the local Claude CLI through Agent Powerups relay when Claude is useful as an external reviewer or advisor.

Compatible with: `codex`, `gemini-cli`, `generic`

Requires:

- Local Claude Code CLI (`claude`)

## When to Use

- You need a second opinion from Claude on a focused question.
- The task benefits from Claude's reasoning, but not from a persistent session.
- You want an artifacted relay turn instead of pasting terminal output into chat.

Do not use for multi-turn advisory context. Use `relay-gemini` or a dedicated session workflow when context must persist.

## Inputs

- Relay session name
- Focused prompt with repository context, constraints, and expected output
- Optional files or snippets summarized into the prompt

## Workflow

1. Verify the CLI is available:

```bash
claude --version
```

2. Start a relay session for Claude:

```bash
apx relay start <name> --provider claude
```

3. Ask one focused question:

```bash
apx relay ask <name> "<prompt>"
```

4. Read the relay artifact before acting on the advice.
5. Stop the relay session when done:

```bash
apx relay stop <name>
```

## Output

- A relay artifact containing Claude's answer
- A short local summary of whether the answer is actionable
- Any follow-up questions captured as new, explicit relay asks

## Verification

- [ ] `claude --version` worked or missing CLI was reported.
- [ ] Prompt included enough context for a one-shot answer.
- [ ] Relay artifact was read before using the result.
- [ ] Claude's advice was verified against repository files before edits.
- [ ] Session was stopped or intentionally left active.

## Failure Modes

- Treating a one-shot Claude answer as verified fact.
- Sending vague prompts that lack file paths, constraints, or output format.
- Expecting cross-turn memory from the Claude relay.
- Leaving relay sessions running without a reason.
