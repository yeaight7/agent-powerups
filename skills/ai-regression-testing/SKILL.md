---
name: ai-regression-testing
description: Deterministic checks first, agent review second, regression test for every real bug fixed or document why not. Targets the blind spot where an agent writes and reviews its own code.
---

# AI Regression Testing

When an agent writes code and then reviews it, it carries the same assumptions into both steps. Automated tests break this cycle.

## When to Use

- An agent has modified logic, API routes, or data transformation code
- A bug was found — need to prevent re-introduction
- Running `/bug-check` after a change session
- Multiple execution paths exist (feature flags, sandbox vs production, env variants)

## The Core Problem

```
Agent writes fix → Agent reviews fix → Agent says "looks correct" → Bug still present
```

The most common blind spot: an agent fixes the production path but leaves the sandbox/mock path unchanged, or vice versa.

## Workflow

Run in order. Do not skip to agent review if automated steps fail.

### Step 1 — Run Tests (mandatory)

```bash
npm test      # or: pytest, cargo test, go test ./...
npm run build # TypeScript build / type check
```

- **Test fail** → highest priority; fix before anything else
- **Build fail** → report type errors as highest priority
- **Both pass** → continue to Step 2

### Step 2 — Agent Code Review

With tests passing, do a focused review for patterns agents commonly miss:

1. **Execution path parity**: Do all code paths (sandbox, production, feature-flag on/off) return the same response shape?
2. **Query completeness**: Are all fields used in the response present in the query or selection?
3. **Error state cleanup**: On error, is stale state cleared before the error is surfaced?
4. **Optimistic update rollback**: If an API call fails, is the optimistic UI change reverted?

### Step 3 — Write a Regression Test for Each Bug Fixed

For every bug found and fixed, add a test immediately:

```
Bug: <description>
File: <path>
Regression test: <test name and what it asserts>
```

If you cannot write a test, document why:
```
Bug: <description>
Regression test: DEFERRED — <reason> (e.g., requires E2E harness not yet in place)
```

Do not silently skip. Every real bug should either have a test or an explicit deferral note.

## Writing Effective Regression Tests

Test the contract, not the implementation:

```typescript
// Test what the consumer receives, not how it's computed
const REQUIRED_RESPONSE_FIELDS = ["id", "email", "settings", "created_at"];

it("profile endpoint returns all required fields", async () => {
  const res = await GET(createRequest("/api/user/profile"));
  const json = await res.json();
  for (const field of REQUIRED_RESPONSE_FIELDS) {
    expect(json.data).toHaveProperty(field);
  }
});
```

Name tests after the bug category, not the fix:

```typescript
it("sandbox path returns same field set as production path (BUG-CLASS: path-parity)")
it("notification_settings is not undefined after SELECT * removal (regression)")
```

## Common AI Regression Patterns

| Pattern | Check | Priority |
|---------|-------|----------|
| Execution path parity | Same response shape across all paths | High |
| Query field omission | All response fields present in DB query | High |
| Error state leakage | State cleared before error is returned | Medium |
| Missing rollback | Previous state restored on API failure | Medium |

## Strategy

Do not aim for coverage percentage. Write tests only for bugs that were found. Bug clusters naturally: if three bugs appeared in `/api/user/profile`, that endpoint needs tests. An endpoint that has never had a bug does not need tests yet.

Tests added this way grow organically with the bug history and cannot be gamed by coverage metrics.
