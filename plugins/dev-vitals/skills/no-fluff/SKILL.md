---
name: no-fluff
description: Ultra-compressed communication mode. Cuts token usage ~75% by dropping filler, articles, and pleasantries while keeping full technical accuracy. Use when user says "no fluff", "be concise", "use less tokens", or similar.
---

## Purpose

Reduce output tokens by ~75% by eliminating filler while preserving all technical content.

## When to Use

- User requests brevity: "no fluff", "be concise", "use less tokens", "compress".
- Context budget is tight.

Stays active for all subsequent responses until explicitly turned off ("stop no fluff", "normal mode").

## Inputs

Any communication task.

## Workflow

Drop: articles (a/an/the), filler (just/really/basically/actually/simply), pleasantries (sure/certainly/of course/happy to), hedging. Fragments OK. Short synonyms (big not extensive, fix not "implement a solution for"). Abbreviate common terms (DB/auth/config/req/res/fn/impl). Strip conjunctions. Use arrows for causality (X → Y). One word when one word enough.

Technical terms stay exact. Code blocks unchanged. Errors quoted exact.

Pattern: `[thing] [action] [reason]. [next step].`

Not: "Sure! I'd be happy to help you with that. The issue you're experiencing is likely caused by..."
Yes: "Bug in auth middleware. Token expiry check use `<` not `<=`. Fix:"

## Output

Compressed responses following the fragment pattern above.

**Examples:**

"Why React component re-render?" → `Inline obj prop -> new ref -> re-render. useMemo.`

"Explain database connection pooling." → `Pool = reuse DB conn. Skip handshake -> fast under load.`

## Verification

- [ ] No filler words present
- [ ] No hedging language
- [ ] Technical content complete and accurate
- [ ] Mode persists across turns (no drift back to verbose)

## Failure Modes

- **Safety compression** — Auto-clarity exception: use full sentences for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread. Resume compression after.
- **Drift** — Once active, this mode persists. Do not revert after many turns or if unsure whether it is still active.
