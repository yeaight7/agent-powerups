---
name: ci-failure-readout
description: Use when a CI pipeline has failed and the real error must be extracted from thousands of lines of noisy logs.
---

## Purpose

CI logs are notoriously noisy. Extract the one true error, prove it locally, and write a readout — do not dump the entire log into the context window.

## When to Use

- A CI pipeline failed and the error is buried in long logs
- A readout is needed before deciding what (or who) fixes the failure
- A CI failure must be reproduced locally before fixing

## Inputs

- Access to the CI run (e.g., `gh` for GitHub Actions) or a downloaded log file
- The repo, to rerun the failing command locally

## Workflow

1. **Locate the true error.** Find the exact step that failed; ignore setup/teardown noise:

   ```bash
   gh run list --limit 10               # find the failing run
   gh run view <run-id>                 # failing job and step
   gh run view <run-id> --log-failed    # logs from failing steps only
   # or, with a downloaded log:
   grep -n -iE "error|failed|exit code" ci.log | head -20
   ```

2. **Extract the trace.** Copy only the stack trace or the specific compiler/linter error message — not the surrounding noise.

3. **Reproduce locally.** The first rule of fixing a CI failure is proving it fails locally. Run the exact command the CI runner used (read it from the workflow/step definition), e.g.:

   ```bash
   npm run test:e2e    # whatever the failing step actually ran
   ```

4. **Draft the readout.** Before fixing it, write a 2-sentence summary: "CI failed during the `build` step because `src/types.ts` is missing an export." This forces you to understand the problem instead of blindly guessing.

## Output

- The failing step, the extracted error (trace or message only), local repro status, and the 2-sentence readout

## Verification

- [ ] Failing step identified by name, not "somewhere in CI"
- [ ] Only the relevant trace/error extracted — no full-log dumps in context
- [ ] Failure reproduced locally with the CI's exact command (or the gap explained)
- [ ] 2-sentence readout written before any fix

## Failure Modes

- **Log flooding** — pasting thousands of lines into context instead of the failing step's error.
- **Fixing without local repro** — pushing speculative fixes and using CI as the test loop.
- **First-red-line fallacy** — the earliest red text may be a symptom; the failing *step* defines where to look.
