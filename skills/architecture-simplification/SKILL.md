---
name: architecture-simplification
description: "Use to collapse over-engineered abstractions, remove unnecessary layers, or consolidate redundant logic."
---

# Architecture Simplification

Over time, codebases accumulate "just in case" abstractions. This skill guides the safe removal of unnecessary complexity.

## Simplification Rules

1. **Identify the Abstraction Cost**: Does this interface have only one implementation? Does this wrapper class just pass arguments straight through?
2. **Inline the Logic**: Move the logic from the unnecessary abstraction directly into the caller.
3. **Delete the Dead Code**: Remove the interface, wrapper, or factory that is no longer needed.
4. **Test Verification**: Ensure the observable behavior of the system has not changed.

## Anti-Pattern
Do not rewrite the entire subsystem. Simplification means removing the noise around the core logic, not changing the core logic itself.

**Example**:
If a `UserRepository` implements `IUserRepository` but there is only ever one database, inline `UserRepository` and delete `IUserRepository`.