# Minimal Setup Example

Goal: inspect Agent Powerups without mutating an agent's global config.

```powershell
npm install
npm run build
npm link
apx doctor
apx list
apx setup codex --agent-root .agent-powerups-demo\codex --dry-run
```

Apply to a disposable local root:

```powershell
apx setup codex --agent-root .agent-powerups-demo\codex --yes
```

Review:

```text
.agent-powerups-demo/codex/agent-powerups/skills/
.agent-powerups-demo/codex/agent-powerups/commands/
.agent-powerups-demo/codex/agent-powerups/instructions/agent-powerups.md
```

Rollback:

```powershell
Remove-Item .agent-powerups-demo -Recurse -Force
```

No shell profiles, secrets, background processes, hooks, or MCP servers are enabled by this example.
