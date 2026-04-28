# MCP Configs

This repository currently ships one local-first MCP config family: `github-local`.

Use `apx mcp print <config-name> --target <target>` to print snippets for review. Do not paste real tokens into source-controlled files.

## `github-local`

What it does:
- connects an MCP client to the GitHub MCP server through `npx`

Target agents:
- `claude-code`: reviewed `.mcp.json` style snippet based on Claude Code documentation
- `generic`: generic JSON snippet for manual adaptation
- `codex`: experimental TOML-style local snippet for manual review only

Required command/package:
- `npx`
- `@modelcontextprotocol/server-github`

Required environment variables:
- `GITHUB_TOKEN=${GITHUB_TOKEN}`

Security implications:
- grants the MCP client access to GitHub through your token
- token should be set in local environment, not committed
- review scope and permissions of the token before use

Copy/install instructions:
1. Print the snippet:

```sh
node dist/cli/apx.js mcp print github-local --target claude-code
```

2. Copy the printed snippet into your local MCP config by hand.
3. Replace placeholder values locally.
4. Keep real tokens out of git.

Dry-run recommendation:
- Prefer `apx mcp print` plus manual review over any automated config change.

Claude Code note:
- Native Windows setups may require `cmd /c npx ...` wrapping. The shipped Claude Code snippet already uses that conservative form.

Codex note:
- The shipped Codex TOML snippet is experimental and local-only. Review and adapt it before use.
