---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes.
---

## Purpose

Find the root cause of any bug before attempting a fix. Random fixes waste time and create new bugs. Symptom fixes are failure.

**Core principle:** ALWAYS find root cause before attempting fixes.

## When to Use

Use for ANY technical issue:
- Test failures
- Bugs in production
- Unexpected behavior
- Performance problems
- Build failures
- Integration issues

**Use this especially when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

**Do not skip when:**
- Issue seems simple (simple bugs have root causes too)
- You're in a hurry (rushing guarantees rework)
- Someone wants it fixed immediately (systematic is faster than thrashing)

## Inputs

- Bug description or error message.
- Stack trace or reproduction steps.
- Environment context (OS, versions, recent changes).
- Access to the codebase and test suite.

## Workflow

You MUST complete each phase before proceeding to the next.

### Phase 1: Root Cause Investigation

**Before attempting ANY fix:**

1. **Read error messages carefully** — Don't skip past errors or warnings. Read stack traces completely. Note line numbers, file paths, error codes.

2. **Reproduce consistently** — Can you trigger it reliably? What are the exact steps? If not reproducible: gather more data, don't guess.

3. **Check recent changes** — What changed that could cause this? Git diff, recent commits, new dependencies, config changes, environmental differences.

4. **Gather evidence in multi-component systems** — When the system has multiple components (CI → build → signing, API → service → database):
   ```
   For EACH component boundary:
     - Log what data enters the component
     - Log what data exits the component
     - Verify environment/config propagation
     - Check state at each layer

   Run once to gather evidence showing WHERE it breaks.
   Then analyze to identify the failing component.
   Then investigate that specific component.
   ```

5. **Trace data flow** — Where does the bad value originate? What called this with the bad value? Keep tracing up until you find the source. Fix at source, not at symptom. See `references/root-cause-tracing.md` for the complete backward tracing technique.

### Phase 2: Pattern Analysis

1. **Find working examples** — Locate similar working code in the same codebase.
2. **Compare against references** — Read reference implementations completely. Don't skim.
3. **Identify differences** — List every difference between working and broken, however small.
4. **Understand dependencies** — What other components, settings, or config does this need?

### Phase 3: Hypothesis and Testing

1. **Form a single hypothesis** — "I think X is the root cause because Y." Write it down. Be specific.
2. **Test minimally** — Make the smallest possible change to test the hypothesis. One variable at a time.
3. **Verify before continuing** — Did it work? Yes → Phase 4. No → form a new hypothesis. Do not add more fixes on top.
4. **When you don't know** — Say so. Ask for help. Research more. Do not pretend to know.

### Phase 4: Implementation

1. **Create a failing test case** — Simplest possible reproduction. Automated test if possible. Must exist before fixing.

2. **Implement a single fix** — Address the root cause identified. One change at a time. No "while I'm here" improvements.

3. **Verify the fix** — Test passes? No other tests broken? Issue actually resolved?

4. **If fix doesn't work** — STOP. Count how many fixes you've tried.
   - If fewer than 3: return to Phase 1, re-analyze with new information.
   - If 3 or more: question the architecture (see below).

5. **If 3+ fixes failed: question the architecture** — Each fix revealing new shared state or coupling elsewhere is a sign of an architectural problem, not a hypothesis failure. Stop and discuss with the team before attempting another fix.

## Output

```
Root cause: <what caused the bug — specific, not vague>
Evidence: <what you observed that confirmed the hypothesis>
Fix: <what was changed and where>
Test: <test added or updated>
Verification: <how fix was confirmed>
```

## Verification

- [ ] Root cause found (not just symptom location)
- [ ] Single hypothesis tested at a time
- [ ] Minimal fix applied — no bundled changes
- [ ] Test added or updated
- [ ] If 3+ fixes failed: architectural discussion initiated, not another fix attempt

## Failure Modes

**Red flags — STOP and return to Phase 1:**
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- Adding multiple changes at once
- "Skip the test, I'll manually verify"
- "It's probably X" without evidence
- "I don't fully understand but this might work"
- "Here are the main problems: [lists fixes without investigation]"
- Proposing solutions before tracing data flow
- "One more fix attempt" (when already tried 2+)
- Each fix reveals a new problem in a different place

**Common rationalizations:**

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is faster than guess-and-check thrashing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from the start. |
| "I'll write test after confirming fix works" | Untested fixes don't stick. Test first proves it. |
| "Multiple fixes at once saves time" | Can't isolate what worked. Causes new bugs. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. Question pattern, don't fix again. |

## Supporting References

Techniques available in `references/`:
- **`root-cause-tracing.md`** — Trace bugs backward through the call stack to find the original trigger.
- **`defense-in-depth.md`** — Add validation at multiple layers after finding the root cause.
- **`condition-based-waiting.md`** — Replace arbitrary timeouts with condition polling to fix flaky tests.
- **`find-polluter.sh`** — Bisection script to identify which test creates unwanted files or state.

Example implementation in `examples/`:
- **`condition-based-waiting-example.ts`** — Complete TypeScript implementation of condition-based waiting utilities.
