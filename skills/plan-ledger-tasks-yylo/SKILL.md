---
name: plan-ledger-tasks-yylo
description: Create a concise Product Development Requirement and one or more implementation-sized YYLO Ledger tasks when the user explicitly asks to plan or register work.
---

# Plan Ledger tasks (YYLO)

## Purpose

Turn a requested change into one concise Product Development Requirement (PDR) and one or more implementation-sized YYLO Ledger tasks, with the PDR captured as an immutable artifact receipt.

## When to Use

- The user explicitly asks to plan, register, or break down work.
- Work needs durable requirements and acceptance criteria before any code changes.
- Follow-up tasks need explicit dependencies and ordering.

Do not use when:

- The user asks for an immediate small edit with no planning step.
- The YYLO CLI is absent and the user declines installation (see Requirements).

## Requirements

Required tool:

- YYLO CLI (`yy`), installed from the npm package `@yylo/cli`

Check:

```bash
yy --version
```

Install (requires user approval — do not auto-install):

```bash
npm install -g @yylo/cli
```

Fallback:

- If `yy` is not installed or the Ledger artifact API is unavailable, keep the drafted requirement as a plain external Markdown file and say so.
- Never fake task IDs, receipts, or digests, and never store planning state inside the product repository to compensate.

## Inputs

- The user's request: required features, constraints, acceptance criteria.
- Project instructions (AGENTS.md/CLAUDE.md) and the relevant product code and docs.

## Workflow

1. Read the project instructions and the relevant product code. Read existing task and spec metadata through the installed `yy ledger` commands; do not assume a specific plan file exists.
2. Draft one concise PDR covering goal, current behavior, scope, exclusions, risks, dependencies, acceptance criteria, and focused tests. Keep the draft in a fresh external file — not inside the product tree and not inside a task body.
3. Preflight `yy ledger --help` and `yy ledger artifact --help`. Capture the PDR as a local immutable `report` Artifact Record with task/request provenance, then verify its ID, digest, size, retention, retrieval, and history.
4. Split work into tasks only where pieces can be implemented and validated independently. Concurrent tasks need explicit path ownership and dependencies.
5. Create tasks through routed `yy ledger` commands. Put concise durable requirements and acceptance criteria in each task body, record the PDR artifact ID in supported task fields or provenance, and relate follow-ups instead of reopening archived task IDs.
6. Keep planning metadata out of product worktrees: a product repository ships product documentation only.
7. Do not start implementation, create worktrees, push, deploy, or mutate production unless the user separately asks.

Use `--id`, not legacy `--ID`, for task mutations. Return the task IDs and a short dependency/order summary.

## Output

- One immutable PDR artifact (ID, digest, size, retention).
- Task IDs with a dependency and ordering summary.
- A clear statement when any step fell back to a plain external draft.

## Verification

- Re-read the PDR artifact by ID: `yy ledger get RECORD_ID -f json`. If the installed `get` is task-only, try `yy ledger record get RECORD_ID -f json` after checking native help; stop and request an upgrade if neither is available.
- For unknown IDs use bounded search: `yy ledger record search --projection summary --limit 20` — not trial-and-error typed gets.
- Check exit status, digest, and size; verify included text or explicitly retrieve local bytes with `--content --max-content-bytes N` (64 KiB default, 16 MiB maximum). Never download external payloads implicitly.
- Report the actual Record kind/profile, immutable Record ID, and Ledger slug from a returned Record or a native readback — never invent a slug from a title or confuse it with the ID. If the API omits a field, say it is unavailable.

## Failure Modes

- `yy` missing or fails to start: keep the external draft, surface the install command, and stop before creating records.
- Artifact API unavailable: stop with the draft intact and request a compatible runtime; do not fall back to product docs, task bodies, or direct store edits.
- Ambiguous, missing, or corrupt records: preserve the diagnostic and report it; do not guess record kinds, projects, or storage types.
- Archived task needing more work: relate a follow-up task instead of reopening the archived ID.
