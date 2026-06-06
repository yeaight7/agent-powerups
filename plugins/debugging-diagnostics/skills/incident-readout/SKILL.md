---
name: incident-readout
description: Use when a bug fix or complex debugging session concludes and a blameless post-mortem summary is needed for human review.
---

## Purpose

When a complex debugging session ends, produce an incident readout. This prevents knowledge loss and helps humans review the fix quickly. Keep it blameless: causes and prevention, not people.

## When to Use

- A bug fix landed after a non-trivial debugging session
- An incident is resolved and needs a reviewable summary
- Session knowledge would otherwise be lost at handoff

## Inputs

- The fix (diff or commits) and the debugging context from the session
- The related PR or issue, if one exists

## Workflow

1. **Reconstruct the facts from history** — pull them from the repo rather than recalling them:

   ```bash
   git log --oneline -10                             # the fix commits
   git show <fix-commit> --stat                      # what the fix touched
   gh pr view <number> --json title,body,comments    # if a PR exists
   ```

2. **Fill the readout structure.** Output an incident readout document (or print to terminal) using this structure:

   ```markdown
   ### 1. The Symptom
   What was reported? (1-2 sentences)

   ### 2. The Root Cause
   What was the actual underlying technical reason for the failure? Be highly
   specific about the exact line of code, assumption, or state that failed.

   ### 3. The Fix
   What did we change to fix it? Provide a high-level summary of the
   structural change, not just a diff.

   ### 4. Prevention
   How do we ensure this never happens again? (e.g., "Added test case X",
   "Refactored module Y to be strongly typed").
   ```

## Output

- A four-section readout (Symptom / Root Cause / Fix / Prevention), as a document or terminal output

## Verification

- [ ] Root cause names the specific line, assumption, or state — not a vague area
- [ ] Fix described structurally, not as a pasted diff
- [ ] Prevention is a concrete action, not "be more careful"
- [ ] Claims cross-checked against the actual commits/PR, not memory

## Failure Modes

- **Symptom-as-cause** — restating the error message in the Root Cause section.
- **Diff dumping** — pasting the patch where a structural summary is needed.
- **Empty prevention** — "fixed it" without a regression test or structural guard.
