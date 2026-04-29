---
name: ask-claude
description: Use when a Codex or generic local agent needs a focused second opinion from Claude CLI without MCP routing.
---

# Ask Claude

## Purpose

Use local Claude Code CLI as an external advisor for focused questions, reviews, or design checks. The workflow is local-first and always leaves a Markdown artifact.

## When to Use

- Need a Claude second opinion from Codex App or another shell-capable agent.
- Want reviewable output from `claude -p` saved for later.
- Do not use when Claude CLI is missing or unauthenticated.
- Do not use as an MCP fallback.

## Inputs

- A specific prompt or task.
- Local `claude` command available in PATH.
- Optional artifact directory.

## Workflow

Run through APX:

```bash
apx ask-claude "Review this patch for correctness"
```

Equivalent nested APX and direct CLI calls:

```bash
apx ask claude "Review this patch for correctness"
```

```bash
claude -p "Review this patch for correctness"
```

If `claude` is missing, stop and ask the user to install/configure Claude Code CLI. Verify with:

```bash
claude --version
```

## Output

APX writes:

```text
.apx/artifacts/claude-<slug>-<timestamp>.md
```

Artifact sections:

- Original user task
- Final prompt sent to Claude CLI
- Claude output (raw)
- Concise summary
- Action items / next steps

## Verification

```bash
apx check ask-claude
apx ask-claude "Return OK only" --json
```

Confirm JSON includes `provider`, `artifactPath`, `promptLength`, and raw output in `stdout`. Open the artifact before applying advice.

## Failure Modes

- **Missing CLI**: do not use MCP; ask user to install/configure `claude`.
- **Auth failure**: keep artifact if APX created one, report CLI stderr.
- **Broad prompt**: narrow the question before running to avoid noisy advice.
