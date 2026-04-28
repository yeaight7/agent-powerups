# MCP Configs

This repository currently ships one local-first MCP config family: `github-local`.

Use `apx mcp print <config-name> --target <target>` to print snippets for review, `apx mcp check` to validate local requirements, and `apx mcp write` to write a snippet to an explicit destination. Do not paste real tokens into source-controlled files.

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

Upstream status:
- `@modelcontextprotocol/server-github` is deprecated on npm. This config remains local/demo-compatible, but public docs and production setups should verify current guidance in `github/github-mcp-server`.
- GitHub currently recommends the remote GitHub MCP server for most users when host support exists.

Required environment variables:
- `GITHUB_TOKEN=${GITHUB_TOKEN}`

Security implications:
- grants the MCP client access to GitHub through your token
- token should be set in local environment, not committed
- review scope and permissions of the token before use

Copy/install instructions:
1. Check local requirements:

```sh
node dist/cli/apx.js mcp check github-local --target claude-code
```

2. Print or write the snippet:

```sh
node dist/cli/apx.js mcp print github-local --target claude-code
node dist/cli/apx.js mcp write github-local --target generic --dest .agent-powerups/github-local.json
```

3. Copy the printed or written snippet into your local MCP config by hand.
4. Replace placeholder values locally.
5. Keep real tokens out of git.

Write safety:
- `apx mcp write` requires `--dest`.
- Existing files are not overwritten unless `--force` is provided.
- No global MCP config is modified by default.

Claude Code note:
- Native Windows setups may require `cmd /c npx ...` wrapping. The shipped Claude Code snippet already uses that conservative form.

Codex note:
- The shipped Codex TOML snippet is experimental and local-only. Review and adapt it before use.
