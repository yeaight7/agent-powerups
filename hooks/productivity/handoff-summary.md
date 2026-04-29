# handoff-summary

Status: review-before-use hook recipe.

Purpose: prompt for a concise handoff summary before ending work.

Suggested trigger:

- before final response
- before PR handoff
- before switching tasks

Suggested check:

1. Confirm changed files are known.
2. Confirm commands run are listed.
3. Confirm validation results are stated.
4. Confirm remaining risks are explicit.

Suggested action:

- If any item is missing, stop and ask the agent to include it.
- Do not run commands automatically.
- Do not commit or push.

Safety:

- This is documentation, not an installed hook.
- It does not inspect secrets or modify files.
