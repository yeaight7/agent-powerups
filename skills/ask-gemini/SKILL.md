---
name: ask-gemini
description: Use when a Codex or generic local agent needs a focused second opinion from Gemini CLI without MCP routing.
---

# Ask Gemini

## Purpose

Use local Gemini CLI as an external advisor for brainstorming, design feedback, or focused reviews. The workflow is local-first and always leaves a Markdown artifact.

## When to Use

- Need a Gemini second opinion from Codex App or another shell-capable agent.
- Want reviewable output from `gemini -p` saved for later.
- Do not use when Gemini CLI is missing or unauthenticated.
- Do not use as an MCP fallback.

**For multi-turn advisory sessions** (persistent context across follow-ups), use `relay-gemini` instead — `apx relay start <name> --provider gemini` keeps context across turns.

## Inputs

- A specific prompt or task.
- Local `gemini` command available in PATH.
- Optional artifact directory.

## Workflow

Run through APX:

```bash
apx ask-gemini "Brainstorm edge cases for this CLI"
```

Equivalent nested APX and direct CLI calls:

```bash
apx ask gemini "Brainstorm edge cases for this CLI"
```

```bash
gemini -p "Brainstorm edge cases for this CLI"
```

If `gemini` is missing, stop and ask the user to install/configure Gemini CLI. Verify with:

```bash
gemini --version
```

## Output

APX writes:

```text
.apx/artifacts/gemini-<slug>-<timestamp>.md
```

Artifact sections:

- Original user task
- Final prompt sent to Gemini CLI
- Gemini output (raw)
- Concise summary
- Action items / next steps

## Verification

```bash
apx check ask-gemini
apx ask-gemini "Return OK only" --json
```

Confirm JSON includes `provider`, `artifactPath`, `promptLength`, and raw output in `stdout`. Open the artifact before applying advice.

## Failure Modes

- **Missing CLI**: do not use MCP; ask user to install/configure `gemini`.
- **Auth failure**: keep artifact if APX created one, report CLI stderr.
- **Broad prompt**: narrow the question before running to avoid noisy advice.
