---
name: architecture-decision-records
description: "Record why an architectural choice was made to prevent agents or humans from unintentionally reverting it."
---

# Architecture Decision Records (ADR)

Code tells you *how* a system works. ADRs tell you *why* it works that way, preventing future maintainers (and AI agents) from suggesting "improvements" that were already tried and discarded.

## ADR Protocol

When finalizing a major design decision (e.g., "Choosing Postgres over MongoDB", "Using custom event bus over Redis"):
1. Create `docs/adr/YYYY-MM-DD-<short-title>.md`.
2. Include the **Context** (what is the problem?).
3. Include the **Decision** (what are we doing?).
4. Include the **Consequences** (what trade-offs are we accepting?).
5. Keep it under 300 words. Focus on constraints, not theory.