# Claude Code Setup Example

Goal: stage Agent Powerups for Claude Code review.

Dry-run first:

```powershell
node dist\cli\apx.js setup claude-code --dry-run
```

Safer first apply with explicit root:

```powershell
node dist\cli\apx.js setup claude-code --agent-root .agent-powerups-demo\claude --yes
```

Then inspect:

```powershell
node dist\cli\apx.js commands print ship-check --target claude-code
node dist\cli\apx.js info using-powerups
```

Instruction file behavior:

- If `<claude-root>\CLAUDE.md` exists, setup can append a marked `agent-powerups` block after creating a backup.
- If it does not exist, setup writes `agent-powerups\instructions\agent-powerups.md` and reports manual steps.

MCP snippets under `agent-powerups\mcp\` are review-only. Do not paste tokens into copied files.
