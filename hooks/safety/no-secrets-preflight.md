# no-secrets-preflight

Status: review-before-use hook recipe.

Purpose: block obvious accidental secret commits before handoff.

Suggested trigger:

- before commit
- before PR creation
- before publishing generated agent assets

Check patterns:

```text
GITHUB_TOKEN=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
BEGIN PRIVATE KEY
password =
```

Suggested action:

1. Scan staged and unstaged text changes.
2. If a pattern appears, stop and show the matching file path only.
3. Ask the user to review locally.
4. Do not print secret values into chat or logs.

Safety:

- This is documentation, not an installed hook.
- Review and adapt to the host agent before use.
- Prefer false positives over leaking credentials.
