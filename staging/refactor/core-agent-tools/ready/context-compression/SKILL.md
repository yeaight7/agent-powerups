---
name: context-compression
description: Use when conversation context is bloated, constraints are being forgotten, or a compact handoff is needed before continuing work.
---

# Context Compression

## When to use
Use when context approaches limits or response quality degrades (due to the "lost in the middle" effect), typically after many turns of debugging or complex planning.

## Requirements / Checks
- Active session contains long stack traces, large file dumps, or multiple failed iterations.

## Workflow
1. **Diagnose Bloat**: Identify redundant outputs, contradictory instructions (clash), and "lost-in-middle" constraint forgetting.
2. **Draft Summary**: Synthesize the *current* valid state of the code/plan.
3. **Extract Anti-patterns**: Note what failed and why (e.g., "Attempted X, failed due to Y").
4. **Generate Handoff**: Write a concise handoff artifact containing the goal, current state, anti-patterns, and exact next step.
5. **Restart**: Instruct the user to start a new chat session and attach the handoff artifact to continue.

## Quality Probes
Before trusting a compression, check it can answer:
- Recall: exact commands, errors, versions, and decisions that still matter.
- Artifact: files created, modified, inspected, and intentionally untouched.
- Continuation: next action, current blocker, validation state, and open risks.
- Decision: why key tradeoffs were chosen and what alternatives were rejected.

## Safety Constraints
- Do NOT silently drop critical architectural constraints or user preferences during compaction.
- Ensure the handoff document is written to disk before asking the user to restart.

## Validation / Done Criteria
- Handoff artifact is created and contains the necessary state to resume work immediately.
- The user is explicitly told to restart the session.
- Quality probes above can be answered from the compacted context without re-reading the full transcript.

## Anti-loss Checklist
- [ ] Goal is clearly stated.
- [ ] Current blocker/next step is identified.
- [ ] Failed approaches are documented to prevent looping.
- [ ] Relevant file paths are listed.

## References
- `references/compression-quality-probes.md`
