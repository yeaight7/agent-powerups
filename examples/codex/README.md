# Codex Setup Example

Goal: stage Agent Powerups for Codex review.

Dry-run first:

```powershell
node dist\cli\apx.js setup codex --dry-run
```

Safer first apply with explicit root:

```powershell
node dist\cli\apx.js setup codex --agent-root .agent-powerups-demo\codex --yes
```

Then inspect:

```powershell
node dist\cli\apx.js info using-powerups
node dist\cli\apx.js check using-powerups
```

Instruction file behavior:

- If `<codex-root>\AGENTS.md` exists, setup can append a marked `agent-powerups` block after creating a backup.
- If it does not exist, setup writes `agent-powerups\instructions\agent-powerups.md` and reports manual steps.

MCP snippets under `agent-powerups\mcp\` are review-only. Do not paste tokens into copied files.
