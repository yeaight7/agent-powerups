# Claude Code Setup Example

Goal: stage Agent Powerups for Claude Code review.

Dry-run first:

```powershell
apx setup claude-code --dry-run
```

Safer first apply with explicit root:

```powershell
apx setup claude-code --agent-root .agent-powerups-demo\claude --yes
```

Then inspect:

```powershell
apx commands print ship-check --target claude-code
apx info using-powerups
```

Instruction file behavior:

- If `<claude-root>\CLAUDE.md` exists, setup can append a marked `agent-powerups` block after creating a backup.
- If it does not exist, setup writes `agent-powerups\instructions\agent-powerups.md` and reports manual steps.

MCP snippets under `agent-powerups\mcp\` are review-only. Do not paste tokens into copied files.
