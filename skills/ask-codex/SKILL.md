---
name: ask-codex
description: Use when a Claude Code agent needs to delegate a question, subtask, or review to a local Codex instance.
---

# Ask Codex

## Purpose

Use the local Codex CLI as an external worker or advisor from inside a Claude Code session. Hand off a focused task, collect the output, and save a reviewable Markdown artifact before acting on the result.

## When to Use

- Need a Codex second opinion on a design decision or code change.
- Want to delegate a self-contained subtask to Codex and inspect the result.
- Exploring a problem from a different model's perspective.
- Do not use when `codex` CLI is missing or unauthenticated.
- Do not use for tasks that require interactive back-and-forth — Codex output is captured once.

## Requirements

- `codex` CLI available in PATH and authenticated.
- Verify with:

```bash
codex --version
```

If `codex` is missing, stop and ask the user to install it. Installation reference:

```bash
npm install -g @openai/codex
```

## Inputs

- A specific, scoped prompt or task description.
- Optional: file paths or code snippets to include inline in the prompt.
- Optional: artifact output directory (defaults to `.apx/artifacts/`).

## Workflow

### 1. Check the CLI is available

```bash
codex --version
```

If this fails, stop. Do not proceed without `codex` in PATH.

### 2. Compose a focused prompt

Keep it narrow. Codex works best with:
- A single question or task.
- Concrete context (file names, function names, error messages).
- A defined output shape ("respond with a patch", "list edge cases", "answer yes/no and explain").

Example prompt:

```text
Review this TypeScript function for correctness. Return a bullet list of issues found.

<paste function here>
```

### 3. Run Codex and capture output

```bash
codex "Review this TypeScript function for correctness. Return a bullet list of issues found.\n\n$(cat src/cli/commands/validate.ts)"
```

Redirect output to an artifact file:

```bash
codex "Your prompt here" > .apx/artifacts/codex-review-$(date -u +%Y%m%dT%H%M%SZ).md
```

On Windows (PowerShell):

```powershell
codex "Your prompt here" | Out-File .apx/artifacts/codex-review-$(Get-Date -Format 'yyyyMMddTHHmmssZ').md
```

### 4. Read and evaluate the artifact

Open the artifact before acting on any recommendation. Codex output is a suggestion, not a directive. Apply judgment before implementing.

### 5. Report

In the response to the user, include:
- The prompt sent to Codex.
- The artifact path.
- A summary of relevant findings.
- Any recommendation you are or are not acting on, with rationale.

## Output Shape

Artifact path convention:

```text
.apx/artifacts/codex-<slug>-<timestamp>.md
```

Artifact should contain:
- The original task or question.
- The exact prompt sent to Codex.
- Raw Codex output.
- Your concise summary.
- Action items or explicit "no action" decision.

## Failure Modes

- **Missing CLI**: stop, ask user to install `codex`, do not improvise.
- **Empty output**: report it; do not fabricate a result.
- **Off-topic output**: note it in the artifact, do not use it.
- **Auth failure**: report the stderr; check `codex --version` and reauthenticate.
- **Prompt too broad**: narrow the scope before retrying.

## apx Integration

`apx check ask-codex` verifies whether `codex` is present in PATH.

`apx ask codex` is not implemented in v1. The direct invocation above is the supported path. Wire-up via `apx ask` requires verification of Codex CLI's non-interactive output flag; see the catalog entry notes.
