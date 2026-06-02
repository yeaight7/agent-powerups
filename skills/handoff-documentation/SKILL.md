---
name: handoff-documentation
description: "Write state-restoration documents for passing tasks between agents or engineers."
---

# Handoff Documentation

When a session ends, the context window is destroyed. Handoff docs serialize the necessary state to allow immediate resumption without re-reading the entire codebase.

## Handoff Protocol

1. Write a handoff document before concluding the task.
2. **Current State**: What exactly is broken or unfinished? (e.g., "Test X in foo.spec.ts is failing with Error Y").
3. **Next Action**: Provide the exact terminal command the next agent/human should run to see the failure.
4. **Discovered Constraints**: Note any dead ends encountered so the next session doesn't repeat the mistake (e.g., "Tried using Library Z, but it doesn't support async").
