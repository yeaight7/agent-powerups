---
name: ci-failure-readout
description: "Use when a CI pipeline fails to extract the actual error from thousands of lines of logs."
---

# CI Failure Readout

CI logs are notoriously noisy. Do not dump the entire log into the context window. 

## Readout Protocol

1. **Locate the True Error**: Search the CI log (using the UI or by downloading and `grep`ing it) for the exact step that failed. Ignore setup/teardown noise.
2. **Extract the Trace**: Copy only the stack trace or the specific compiler/linter error message.
3. **Reproduce Locally**: The first rule of fixing a CI failure is proving it fails locally. Run the exact command the CI runner used (e.g., `npm run test:e2e`).
4. **Draft the Readout**: Before fixing it, write a 2-sentence summary: "CI failed during the `build` step because `src/types.ts` is missing an export." This forces you to understand the problem instead of blindly guessing.