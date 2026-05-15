---
name: context-compression
description: Use when conversation context is bloated, constraints are being forgotten, or a compact handoff is needed before continuing work.
---

# Context Compression

## When to use
Use when context approaches limits or response quality degrades (repeated mistakes, forgotten constraints, lost-in-the-middle effects) — typically after many turns of debugging or complex planning.

## Requirements / Checks
- Active session contains long stack traces, large file dumps, or multiple failed iterations.

## Workflow

1. **Diagnose bloat** — identify: redundant outputs (same file read multiple times), contradictory instructions that accumulated over turns, constraint forgetting (earlier requirements no longer respected).

2. **Draft summary** — synthesize the *current* valid state of the code or plan in 3–5 sentences.

3. **Extract anti-patterns** — list what failed and why: `"Attempted X → failed because Y"`. These are critical to prevent the next session from looping on the same mistakes.

4. **Generate handoff artifact** — write the following template to disk:

   ```markdown
   ## Goal
   [One-sentence objective]

   ## Current state
   [What is working / what is in place right now]

   ## Blocker / next step
   [The exact next action to take]

   ## Anti-patterns (do not repeat)
   - Tried X → failed because Y
   - Tried A → blocked by B

   ## Key files
   - `path/to/file.ts` — [what it does / why it matters]

   ## Open risks
   - [Anything uncertain or requiring verification]

   ## Decisions made
   - [Key tradeoffs and why alternatives were rejected]
   ```

5. **Restart** — tell the user to start a new chat session and attach the handoff file as the first message.

## Quality Probes

Before finalizing, verify the handoff can answer:
- **Recall**: exact commands, errors, versions, decisions that still matter.
- **Artifact**: files created, modified, inspected, intentionally untouched.
- **Continuation**: next action, current blocker, validation state, open risks.
- **Decision**: why key tradeoffs were chosen and what alternatives were rejected.

## Safety Constraints
- Do NOT silently drop critical architectural constraints or user preferences during compression.
- Write the handoff document to disk before asking the user to restart.

## Validation / Done Criteria
- Handoff artifact exists on disk and is in the template format above.
- User is explicitly told to restart the session and attach the file.
- All four quality probes (recall, artifact, continuation, decision) can be answered from the artifact without re-reading the full transcript.

## Anti-loss Checklist
- [ ] Goal is clearly stated.
- [ ] Current blocker / next step is identified.
- [ ] Failed approaches are documented to prevent looping.
- [ ] Relevant file paths are listed.
- [ ] Key decisions and their reasons are recorded.

## References
- `references/compression-quality-probes.md`
