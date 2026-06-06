---
name: canonical-advisor-routing
description: Use when routing a prompt to a local provider CLI for a second opinion, review, or plan -- you are about to call a provider directly, need the response saved for later, or want a single consistent way to invoke codex/gemini/claude.
---

## Purpose

Route a prompt through a local provider CLI and persist the result as an artifact. The execution path is process-first: always go through the canonical `apx ask-*` wrappers rather than hand-assembled raw provider commands, so routing and artifact capture stay consistent.

## When to Use

- You want a focused second opinion, review, or plan from a local provider
- You are about to invoke a provider CLI directly and want a consistent entry point
- The response needs to be saved to disk for later reference, not just printed
- A previous wrapper run misbehaved and you are debugging the routing

## Inputs

- A clear prompt describing the task for the advisor
- The chosen provider (codex, gemini, or claude) installed and authenticated locally

## Workflow

1. **Pick the provider and frame the prompt.** Choose `ask-codex`, `ask-gemini`, or `ask-claude` based on the task, and write a single self-contained prompt string.

2. **Invoke the canonical wrapper.** Run the prompt through the `apx ask-*` command. Do not manually assemble raw provider CLI commands unless you are debugging the wrapper itself.

   ```bash
   apx ask-codex "review this patch from a security perspective"
   apx ask-gemini "suggest UX improvements for this flow"
   apx ask-claude "draft an implementation plan for issue #123"
   ```

3. **Confirm prerequisites if the call fails.** Verify the selected local CLI is installed and authenticated before retrying; a missing or unauthenticated CLI is the usual cause.

4. **Persist the response as an artifact.** Write the result to the standard artifact location so it can be reviewed later. The path is .agent-powerups/artifacts/ask/ with a filename of the form provider-slug-timestamp (Markdown extension).

5. **For multi-turn or session work, defer to the relay skills.** When the task needs cross-turn context rather than a one-shot answer, route through the relay siblings (`relay-codex`, `relay-gemini`, `relay-claude`) instead of repeated `ask-*` calls.

## Output

- The provider's response written under `.agent-powerups/artifacts/ask/` with a provider-slug-timestamp Markdown filename
- A consistent, reproducible routing path that other agents can follow

## Verification

- [ ] The provider was invoked through an `apx ask-*` wrapper, not a hand-built raw command
- [ ] The selected local CLI was installed and authenticated before the call
- [ ] The response was written to the standard `.agent-powerups/artifacts/ask/` location
- [ ] The artifact filename follows the provider-slug-timestamp pattern

## Failure Modes

- **Bypassing the wrapper** — assembling raw provider CLI commands by hand outside of debugging, which loses consistent routing and artifact capture.
- **Unauthenticated CLI** — invoking a provider whose local CLI is not installed or signed in, so the call fails before producing any artifact.
- **Lost response** — reading the answer from stdout only and never writing it to the artifact location, leaving nothing to review later.
- **Wrong tool for the job** — using one-shot `ask-*` for work that needs cross-turn context instead of the relay siblings.
