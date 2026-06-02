# Compression Quality structured code searchs

## structured code search Types

| structured code search | Question |
| --- | --- |
| Recall | What exact error/command/version/decision still matters? |
| Artifact | Which files were created, modified, inspected, or intentionally untouched? |
| Continuation | What is the next action, current blocker, and validation state? |
| Decision | Why was this approach chosen and what was rejected? |
| Constraint | Which user/project rules must survive? |

## Handoff Template

```text
Goal:
Current state:
Branch/worktree:
Files changed:
Files inspected:
Validation run:
Known failures:
Decisions made:
Rejected approaches:
Next exact step:
Risks:
User preferences:
```

## Pass Criteria

- Another agent can continue without reading full transcript.
- No stale failed approach is presented as active plan.
- File paths and commands are exact.
- User constraints survive.
- Open risks are explicit.

## Common Losses

| Loss | Prevention |
| --- | --- |
| file path drift | list exact paths |
| forgotten failed attempts | include rejected approaches |
| fake completion | include validation evidence |
| lost user preference | include stable preferences |
| bloated handoff | omit raw logs unless needed |
