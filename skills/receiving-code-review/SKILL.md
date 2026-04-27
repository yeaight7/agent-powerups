---
name: receiving-code-review
description: Use when receiving code review feedback, before implementing suggestions — requires technical verification and reasoned pushback, not performative agreement or blind implementation.
---

## Purpose

Evaluate code review feedback with technical rigor before implementing any changes. Prevents wasted work from blindly applying incorrect suggestions and maintains technical integrity.

## When to Use

- Receiving code review comments from any reviewer (human or automated).
- Feedback seems unclear or technically questionable.
- Multiple review items arrive at once and need to be prioritized.

## Inputs

- Code review feedback (comments, suggestions, required changes).
- Access to the codebase to verify claims.

## Workflow

```
1. READ     — Complete feedback without reacting
2. UNDERSTAND — Restate requirement in own words (or ask)
3. VERIFY   — Check against codebase reality
4. EVALUATE — Technically sound for THIS codebase?
5. RESPOND  — Technical acknowledgment or reasoned pushback
6. IMPLEMENT — One item at a time, test each
```

### Handling Unclear Feedback

If any item is unclear: stop, ask for clarification on all unclear items before implementing anything. Items may be related — partial understanding leads to wrong implementation.

### Feedback from the User (Project Owner)

- Trusted — implement after understanding.
- Still ask if scope is unclear.
- Skip to action or brief technical acknowledgment. No performative agreement.

### Feedback from External Reviewers

Before implementing:
1. Is it technically correct for this codebase?
2. Does it break existing functionality?
3. Is there a reason the current implementation exists?
4. Does it work on all target platforms/versions?
5. Does the reviewer understand the full context?

If suggestion is wrong: push back with technical reasoning.
If you cannot easily verify: say so and ask for direction.
If it conflicts with prior architectural decisions: stop and discuss with the project owner before proceeding.

### YAGNI Check

If a reviewer suggests "implementing properly" a feature or endpoint:
```bash
grep -r "feature_name" .
```
If unused: propose removal (YAGNI). If used: implement.

### Implementation Order

For multi-item feedback:
1. Clarify anything unclear first.
2. Then implement in order: blocking issues → simple fixes → complex fixes.
3. Test each fix individually.
4. Verify no regressions.

## Output

For each review item:
- Status: implementing / pushing back / needs clarification
- Rationale (if pushing back or clarifying)
- What changed (if implementing)

When feedback is correct:
```
✅ "Fixed. [Brief description of what changed]"
✅ "Good catch. Fixed in [location]."
✅ [Just fix it and show the code diff]
```

No performative agreement ("you're absolutely right", "great point", "thanks for catching that").

## Verification

- [ ] Each comment understood before acting
- [ ] Technical correctness verified independently
- [ ] Pushback given when feedback is wrong (with reasoning)
- [ ] Each fix tested individually
- [ ] No regressions introduced

## Failure Modes

- **Blind implementation** — Applying feedback without verification can introduce bugs, break functionality, or violate YAGNI.
- **Performative agreement** — Social compliance over technical correctness leads to wrong implementations.
- **Batch without testing** — Implementing multiple items at once without testing each makes regressions untraceable.
- **Avoiding pushback** — Incorrect feedback from external reviewers must be pushed back on, with evidence.

### Common Mistakes

| Mistake | Fix |
|---------|-----|
| Performative agreement | State requirement or just act |
| Blind implementation | Verify against codebase first |
| Batch without testing | One at a time, test each |
| Assuming reviewer is right | Check if it breaks things |
| Partial implementation | Clarify all items first |
| Can't verify, proceed anyway | State limitation, ask for direction |
