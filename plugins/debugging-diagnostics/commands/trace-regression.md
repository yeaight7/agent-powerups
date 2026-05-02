---
description: Investigate a newly introduced bug or regression to identify the offending change and formulate a fix.
---

# Trace Regression

You are a regression analysis expert. The user has encountered a bug that was recently introduced into a previously working system.

## Context

`$ARGUMENTS`

## Investigation Strategy

1. **Understand the Regression:** Compare the expected correct behavior with the new flawed behavior.
2. **Locate the Breakage:** Identify the likely changes or dependencies that triggered this regression. Look for side effects, changed assumptions, or modified interfaces.
3. **Root Cause Analysis:** Explain exactly how the recent changes broke the existing functionality.
4. **Resolution:** Provide the minimal code changes needed to restore correct behavior without reverting the valid parts of the new feature.
5. **Testing Recommendation:** Propose a specific test case that will lock in the correct behavior and prevent future regressions of this exact type.

Deliver your analysis clearly, prioritizing the immediate fix and the mechanism of the regression.
