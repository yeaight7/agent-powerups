# MCP Configs

This repository ships MCP configs for local and remote MCP servers across three target formats:

- `mcp/generic/` — generic `.mcp.json` format
- `mcp/claude-code/` — Claude Code `.mcp.json` format
- `mcp/codex/` — Codex `config.toml` format

All configs use placeholder env vars. No real credentials are included. Review each config and its maturity status before enabling.

---

## Supported Configs

### `github-local`

Local Docker-backed GitHub MCP server. This is the only config with a full `apx` check/smoke/install flow.

**Runtime:** Docker (`ghcr.io/github/github-mcp-server`)
**Required env:** `GITHUB_TOKEN` or `GITHUB_PAT`
**Risk:** Medium. Token scope determines access; prefer read-only unless write operations are needed.
**Maturity:** Beta

```sh
apx mcp check github-local --target codex --json
apx mcp smoke github-local --json
apx mcp install github-local --target codex --dry-run
apx mcp install github-local --target claude-code --dry-run
```

Apply after review:

```sh
apx mcp install github-local --target codex --yes
apx mcp install github-local --target claude-code --yes
```

---

### `github-remote`

Remote HTTP-based GitHub MCP endpoint. Alternative to `github-local` that does not require Docker.

**Runtime:** HTTP (remote)
**Required env:** `GITHUB_MCP_PAT`
**Risk:** High. Token scopes control read/write access to GitHub resources. Use a narrow-scope PAT.
**Maturity:** Beta

---

### `context7`

Up-to-date library and framework documentation retrieval.

**Runtime:** `npx @upstash/context7-mcp`
**Required env:** None
**Risk:** Low. Read-only documentation fetch.
**Maturity:** Beta

---

### `sequential-thinking`

Step-by-step structured reasoning for complex problem decomposition.

**Runtime:** `npx @modelcontextprotocol/server-sequential-thinking`
**Required env:** None
**Risk:** Low.
**Maturity:** Beta

---

### `playwright`

Browser automation and web testing via Playwright.

**Runtime:** `npx @playwright/mcp`
**Required env:** None (browser must be installed)
**Risk:** Medium. Can interact with live web sessions and authenticated apps.
**Maturity:** Beta

---

### `filesystem-repo-scoped`

Filesystem access scoped to the current repository root.

**Runtime:** `npx @modelcontextprotocol/server-filesystem`
**Required env:** None (`${REPO_ROOT}` placeholder)
**Risk:** Medium. Scoped to repo root only; never use home directory.
**Maturity:** Beta

---

### `memory`

Persistent key-value memory store for agent sessions.

**Runtime:** `npx @modelcontextprotocol/server-memory`
**Required env:** None
**Risk:** Low. Local memory only.
**Maturity:** Beta

---

### `fetch`

Generic HTTP fetch and web content intake.

**Runtime:** `npx @modelcontextprotocol/server-fetch`
**Required env:** None
**Risk:** Medium. Can fetch arbitrary remote URLs. Do not use with credentials in requests.
**Maturity:** Beta

---

### `time`

Timezone and time conversion helper.

**Runtime:** `npx @modelcontextprotocol/server-time`
**Required env:** None
**Risk:** Low.
**Maturity:** Beta

---

### `git-local`

Local repository git status, diff, and log via MCP.

**Runtime:** `uvx mcp-server-git` (requires `uv`)
**Required env:** None (`${REPO_ROOT}` placeholder)
**Risk:** Medium. Git tools can mutate local repo state. Review before enabling write operations.
**Maturity:** Beta

---

### `postgres-readonly`

Read-oriented PostgreSQL access for local and dev analytics.

**Runtime:** `npx @modelcontextprotocol/server-postgres`
**Required env:** `POSTGRES_READONLY_DSN`
**Risk:** High if pointed at production. Use a SELECT-only role; never use write credentials or a superuser.
**Maturity:** Beta

---

### `supabase`

Supabase project MCP integration for database, auth, and management API access.

**Runtime:** `npx @supabase/mcp-server-supabase`
**Required env:** `SUPABASE_ACCESS_TOKEN`
**Risk:** High. Management API token grants broad project access. Use a project-scoped token.
**Maturity:** Experimental
**Note:** DRAFT — verify exact flags against current `@supabase/mcp-server-supabase` docs before use.

---

### `vercel`

Vercel project and deployment access via remote HTTP MCP.

**Runtime:** HTTP (`https://mcp.vercel.com/sse`)
**Required env:** `VERCEL_TOKEN`
**Risk:** Medium/high. Deploy/promote/delete actions require explicit approval.
**Maturity:** Beta
**Note:** DRAFT — verify SSE endpoint URL against current Vercel MCP docs.

---

### `cloudflare-docs`

Cloudflare documentation retrieval via read-only remote MCP endpoint.

**Runtime:** HTTP (`https://docs.mcp.cloudflare.com/sse`)
**Required env:** None
**Risk:** Low. Read-only documentation access.
**Maturity:** Beta
**Note:** DRAFT — verify SSE endpoint URL against current Cloudflare MCP docs.

---

### `exa-search`

Exa semantic search and research integration.

**Runtime:** `npx exa-mcp-server`
**Required env:** `EXA_API_KEY`
**Risk:** Medium. Queries are sent to Exa's remote API. Avoid sending sensitive code fragments.
**Maturity:** Beta

---

### `atlassian`

Atlassian Jira and Confluence MCP integration.

**Runtime:** `npx @atlassian/mcp-server`
**Required env:** `ATLASSIAN_API_TOKEN`, `ATLASSIAN_EMAIL`, `ATLASSIAN_DOMAIN`
**Risk:** High. Token grants access to project tickets and wikis. Use read-only scopes where possible.
**Maturity:** Experimental
**Note:** DRAFT — verify package name and env vars against current Atlassian MCP docs.

---

### `browserbase`

Cloud browser automation via Browserbase MCP.

**Runtime:** `npx @browserbasehq/mcp`
**Required env:** `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID`
**Risk:** High. Sessions can interact with live authenticated web applications.
**Maturity:** Experimental

---

### `e2b-sandbox`

Remote sandboxed code execution via E2B.

**Runtime:** `npx @e2b/mcp-server`
**Required env:** `E2B_API_KEY`
**Risk:** Medium. Remote code execution. Do not send secrets or proprietary code without policy approval.
**Maturity:** Experimental

---

## Security Guidelines

- Do not commit real tokens or DSNs.
- Use the narrowest token scope possible for each config.
- Prefer read-only credentials unless write operations are explicitly required.
- Review all DRAFT configs against current upstream docs before enabling.
- Run `apx mcp check <name>` and `apx mcp smoke <name>` before installing any config.
- Dry-run installs with `--dry-run` before applying with `--yes`.

## See Also

- [`docs/security-model.md`](./security-model.md) — full security policy
- [`catalog.json`](../catalog.json) — machine-readable catalog with maturity, warnings, and target paths
- [`hooks/mcp/`](../hooks/mcp/) — hook recipes for MCP write and config change guards
