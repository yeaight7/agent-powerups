---
name: risk-based-review
description: "Use when reviewing code (or your own plan) to allocate attention based on the danger of the change."
---

# Risk-Based Review

Not all code changes deserve the same level of scrutiny. A typo fix in a README is low risk; a change to the authentication middleware is critical.

## Risk Categories

1. **Critical Risk** (Auth, Payments, Cryptography, Database Migrations):
   - Require 100% test coverage for the change.
   - Require explicit human sign-off.
   - Look for edge cases, null pointers, and race conditions.
2. **High Risk** (Core Business Logic, Shared Utilities, Public API changes):
   - Require unit and integration tests.
   - Check for backwards compatibility and blast radius (see `change-impact-check`).
3. **Low Risk** (UI tweaks, isolated components, internal tools):
   - Focus on readability, naming conventions, and simple unit tests.

When acting as a reviewer, explicitly state the Risk Category of the PR before providing feedback.