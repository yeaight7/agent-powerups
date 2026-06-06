---
name: relay-codex
description: Use when another local agent needs a one-shot Codex CLI answer and interactive behavior is acceptable or controlled.
---

## Purpose

Send a bounded prompt to the local Codex CLI through Agent Powerups relay when Codex is useful as an external reviewer or implementation advisor.

Compatible with: `claude-code`, `gemini-cli`, `generic`

Requires:

- Local Codex CLI (`codex`)

## When to Use

- You want Codex to review a plan, diff, or small implementation question.
- A one-shot answer is enough and persistent context is not needed.
- The user has explicitly accepted local Codex CLI use.

Do not use when an interactive TUI would block automation. Check local Codex behavior first.

## Inputs

- Relay session name
- Focused prompt with repo context, files, constraints, and output format
- Optional note about whether Codex may suggest edits or only review

## Workflow

1. Verify the CLI is available and note whether it opens an interactive UI:

```bash
codex --version
```

2. Start a Codex relay session:

```bash
apx relay start <name> --provider codex
```

3. Send one focused prompt:

```bash
apx relay ask <name> "<prompt>"
```

4. Read the relay artifact and verify claims locally before acting.
5. Stop the session unless it is deliberately needed:

```bash
apx relay stop <name>
```

## Output

- A relay artifact containing Codex's response
- A decision on whether the response is accepted, rejected, or needs another review
- Follow-up prompts only when they add new evidence

## Verification

- [ ] `codex --version` worked or missing CLI was reported.
- [ ] Prompt stated whether the task was review-only or implementation advice.
- [ ] Output artifact was read and checked against source files.
- [ ] Any suggested command or edit was independently verified.
- [ ] Session lifecycle was handled explicitly.

## Failure Modes

- Assuming non-interactive behavior across Codex versions.
- Using unsafe automation flags as a default.
- Asking broad implementation questions with no file scope.
- Treating Codex output as approval to skip local tests.
