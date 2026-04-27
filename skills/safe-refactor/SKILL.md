---
name: safe-refactor
description: Use when code needs restructuring without changing observable behavior.
---

1. Confirm current behavior from code and tests.
2. Refactor in small steps.
3. Avoid API/interface changes unless required.
4. Run targeted validation after each meaningful step.
5. Summarize:
   - what changed structurally
   - why behavior should be unchanged
   - what was validated