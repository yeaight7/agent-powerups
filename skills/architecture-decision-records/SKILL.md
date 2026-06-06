---
name: architecture-decision-records
description: Use when a significant architectural choice is being finalized, revisited, or reversed -- technology selection, structural patterns, or trade-offs that future maintainers or agents might unknowingly undo.
---

## Purpose

Code tells you *how* a system works. ADRs tell you *why* it works that way, preventing future maintainers (and AI agents) from suggesting "improvements" that were already tried and discarded.

## When to Use

- Finalizing a major design decision (e.g., "Choosing Postgres over MongoDB", "Using custom event bus over Redis")
- Reversing or superseding a previous decision
- A reviewer or agent proposes a change that contradicts an existing constraint

## Inputs

- The decision, the alternatives considered, and the constraints that drove it
- The ADR directory (conventionally docs/adr/)

## Workflow

1. **Check for an existing ADR first** — the decision may already be recorded or superseded:

   ```bash
   ls docs/adr/                          # existing records
   rg -ln "<topic keyword>" docs/adr/    # is this decision already covered?
   ```

2. **Create the record** at `docs/adr/YYYY-MM-DD-<short-title>.md` — date-prefixed for ordering, kebab-case title.

3. **Fill the structure** — keep it under 300 words; focus on constraints, not theory:

   ```markdown
   # <Decision title>

   ## Status
   Accepted | Superseded by <newer ADR filename>

   ## Context
   What is the problem? What constraints apply?

   ## Decision
   What are we doing?

   ## Consequences
   What trade-offs are we accepting? What becomes harder?
   ```

4. **Handle supersession explicitly.** When reversing a decision, do NOT edit history: write a new ADR, mark the old one "Superseded by" with a link to the new file, and state what changed.

5. **Link from where the decision bites** — a one-line pointer near the affected module or in the architecture doc, so the *why* is discoverable from the *how*.

## Output

- A dated ADR file with Status / Context / Decision / Consequences
- Superseded ADRs updated with forward links — never deleted or rewritten

## Verification

- [ ] File saved under docs/adr/ with a date-prefixed kebab-case name
- [ ] Status, Context, Decision, and Consequences sections all present; body under ~300 words
- [ ] Consequences state real trade-offs, not just benefits
- [ ] Superseded decisions marked and forward-linked, not edited or removed
- [ ] Decision discoverable from the affected code or architecture doc

## Failure Modes

- **Retroactive rewriting** — editing an old ADR to match a new decision destroys the historical why; supersede instead.
- **Theory essays** — pages of architecture philosophy nobody reads; constraints fit in 300 words.
- **Consequence-free records** — a Decision without trade-offs is advocacy, not a record.
- **Orphaned ADRs** — records nobody can find from the code they govern.
