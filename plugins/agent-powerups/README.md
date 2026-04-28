# Agent Powerups Plugin

This directory is an experimental local plugin layout for Codex-style plugin tooling.

Warnings:

- Local only.
- Experimental only.
- Not a verified marketplace package.
- Review all files before using them.
- Do not commit real tokens.

This layout is a convenience mirror for local experimentation. Refresh it from root catalog assets with:

```powershell
node dist\cli\apx.js plugin build --dest plugins\agent-powerups --write
node dist\cli\apx.js plugin validate plugins\agent-powerups
```

It does not automatically install anything and does not mutate global config.
