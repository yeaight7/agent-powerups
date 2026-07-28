---
name: ax-workflow-recall
description: Use when the user wants to reconstruct how a coding-agent result happened from local ax session history.
---

# Ax Workflow Recall

## Purpose

Reconstruct the prompts, tools, checks, failures, and repairs that produced a coding-agent result. Use local `ax` data as evidence, then write a repeatable workflow only for steps the history supports.

## When to Use

- The user asks how a working result, commit, fix, or artifact was produced.
- The user wants to extract a workflow from earlier agent sessions.
- The useful evidence is likely in local agent transcripts, tool calls, churn, or skill usage.

Do not use when:

- The user only needs a normal code review or git diff summary.
- The local machine does not have relevant session history.
- The user asks for a workflow you cannot verify from evidence.

## Requirements

Required tool:

- `ax` CLI

Check:

```sh
ax --version
```

Install, after user approval:

```sh
curl -fsSL ax.necmttn.com/install | sh
```

Rules:

- Do not assume `ax` is installed.
- Do not install `ax` without user approval.
- Show the install command before running it.
- If install is declined, fall back to git history, local transcript files, and direct code inspection.
- If `ax` is installed but has no relevant ingested sessions, suggest `ax ingest` or `ax ingest here`, or continue with the fallback evidence. Do not invent missing workflow steps.
- Local `ax` history may contain secrets, private user text, or credentials. Redact secrets and avoid quoting sensitive transcript content unless it is explicitly needed and approved.

## Inputs

- A commit SHA, date, artifact path, bug/fix description, or natural-language question.
- The project path when the question is not for the current repo.
- Optional keywords for `ax recall`.

## Workflow

1. Check that `ax` is available:

   ```sh
   ax --version
   ```

2. Set project scope before query commands. If the target project is not the current working directory, change into it first so `--scope=here` and `--here` commands resolve correctly:

   ```sh
   cd <project>
   ```

   If the anchor is a date plus project path, use the explicit project form:

   ```sh
   ax sessions around <date> --project=<path>
   ```

3. Find candidate sessions. Prefer the narrowest anchor the user gave:

   ```sh
   ax sessions near <sha>
   ax sessions around <date> --project=<path>
   ```

4. If the prompt or artifact is described in words, search local recall from the repo:

   ```sh
   ax recall <q> --scope=here
   ```

5. Inspect promising sessions in full:

   ```sh
   ax sessions show <id> --all
   ```

   Track the sequence of user prompts, tool calls, edits, test runs, failures, and follow-up repairs.

6. Check verification churn for the current repo:

   ```sh
   ax sessions churn --here
   ```

   Use this to spot repeated failure/pass cycles, repair-heavy files, and checks that mattered.

7. Check skill usage when the result may depend on a reusable agent workflow:

   ```sh
   ax skills weighted
   ```

8. Build the reconstruction:

   - Start with the session or commit anchor.
   - List the chronological steps that have evidence.
   - Quote or summarize only enough prompt/tool/check detail to explain the workflow.
   - Separate confirmed facts from plausible inferences.
   - Name gaps where local history is missing.

## Output

Return a short workflow report:

- Evidence used: session IDs, commit/date anchors, recall queries, and commands run.
- Sequence: prompts, tools, edits, checks, failures, repairs, and final verification.
- Repeatable workflow: the smallest reusable procedure.
- Gaps: anything not present in `ax`, git, transcripts, or files.

## Fallbacks

If `ax` is missing, unavailable, or has no relevant ingested sessions:

1. Say which evidence source is unavailable.
2. If `ax` is missing, ask before installing it.
3. If `ax` is installed but local history is empty or stale, suggest `ax ingest` or `ax ingest here`.
4. Use git history, local transcript files, shell history, test logs, or direct file inspection when available.
5. Mark the result as partial when evidence is incomplete.
6. Do not fabricate prompts, tool calls, checks, or repairs.

## Verification

- [ ] `ax --version` was run before any `ax` query.
- [ ] Session selection used a SHA, date, project path, or recall query tied to the user's question.
- [ ] `ax sessions show <id> --all` was used for any session treated as evidence.
- [ ] The report distinguishes evidence from inference.
- [ ] Missing `ax` data led to fallback evidence or an explicit gap, not invented history.
