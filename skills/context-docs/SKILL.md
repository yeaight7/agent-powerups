---
name: context-docs
description: "Maintain short, focused Markdown files per subsystem to provide agents with isolated context."
---

# Context Docs

Large centralized documentation files consume too much context window. Decentralized, module-specific context docs provide targeted information exactly when an agent needs it.

## Context Protocol

1. Place README or CONTEXT docs *inside* specific subsystem directories (e.g., `src/auth/CONTEXT.md`).
2. Document only the boundaries: How does this module communicate with the rest of the app? What are its critical invariants?
3. Keep it terse. Use bullet points and exact file paths.
4. Update these files inline when refactoring the module.
