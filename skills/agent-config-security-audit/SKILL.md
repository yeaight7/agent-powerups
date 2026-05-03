---
name: agent-config-security-audit
description: Audit agent configuration files for security vulnerabilities and misconfigurations. Covers settings.json, .mcp.json, .codex/config.toml, AGENTS.md, hooks, plugin manifests, and relay config. Classify findings as P0 or P1.
---

# Agent Config Security Audit

Systematic security review of agent configuration files. Run before committing config changes or onboarding a new repository.

## When to Use

- After modifying any agent config file (`.claude/settings.json`, `.claude/mcp.json`, AGENTS.md, hooks)
- Before committing configuration changes to version control
- When onboarding a project with existing agent configs
- Periodic hygiene check (monthly or after a major dependency update)

## Scope

Audit every config file present:

| File | Agent |
|------|-------|
| `.claude/settings.json` | Claude Code |
| `.claude/mcp.json` (or project-root mcp.json) | Claude Code |
| `.codex/config.toml` | Codex |
| `docs/AGENTS.md` (project root) | Generic/Codex |
| `docs/CLAUDE.md` (project root) | Claude Code |
| `hooks/` | Any |
| `plugins/*/plugin.json` | Agent Powerups |
| `.apx/relay/*.json` | apx relay |

## Audit Checklist

### Secrets and Credentials

- [ ] No API keys, tokens, or passwords hardcoded in any config file
- [ ] All secrets referenced as `$ENV_VAR` or `process.env.*` — never literal values
- [ ] `.env` and `.env.local` files are in `.gitignore`
- [ ] MCP server `env` fields contain variable references, not values

**P0 (block immediately):** Hardcoded secret in any committed file.

### Permissions and Allow Lists

- [ ] `allowedTools` is scoped — no `Bash(*)` wildcard granting unrestricted shell access
- [ ] `deniedTools` list is present and non-empty for risky operations
- [ ] MCP server tool scopes match the stated purpose of the server
- [ ] No `--no-verify`, `--force`, or safety-bypass flags in hook commands

**P0:** `Bash(*)` or equivalent wildcard in allow list.
**P1:** No `deniedTools` list when `Bash` is in scope.

### Hooks

- [ ] Hook commands use fixed strings — no `${file}`, `${input}`, or other user-interpolated variables
- [ ] No outbound network calls (`curl`, `wget`) in hooks without explicit user knowledge
- [ ] Errors in safety hooks are not silently suppressed (`2>/dev/null`, `|| true`)
- [ ] PreToolUse hooks for high-risk tools (file delete, shell exec) are present

**P0:** Command injection via interpolation in any hook.
**P1:** Silent error suppression on a security or quality hook.

### MCP Servers

- [ ] Each server is from a known, trusted source
- [ ] No `npx -y` without a pinned version or digest
- [ ] Each server has a `description` field
- [ ] Servers not in active use are removed or disabled

**P1:** Unpinned `npx -y` auto-install in MCP server config.

### AGENTS.md / CLAUDE.md

- [ ] No auto-run instructions that would execute arbitrary commands on session start
- [ ] No instructions that unconditionally override safety behavior
- [ ] Prohibitive instructions present (explicit list of what the agent must NOT do)
- [ ] No prompt injection patterns (user-controlled values inlined into instructions)

**P1:** Auto-run instruction with shell exec; unconditional safety override.

### Plugin Manifests

- [ ] Each plugin's manifest (`plugins/NAME/.codex-plugin/plugin.json`) declares tool access scoped to its purpose
- [ ] No plugin grants broader access than it needs
- [ ] Plugin version pinned, not `latest`

### Relay Config (if present)

- [ ] Relay session files (`.apx/relay/`) are in `.gitignore`
- [ ] No secrets in relay artifact files

## Classification

| Severity | Definition | Response |
|----------|-----------|----------|
| **P0** | Can directly compromise security or leak secrets | Fix before any commit; do not push |
| **P1** | Increases attack surface or weakens safety controls | Fix before merging; document exception if deferred |
| **Note** | Best practice not followed, no direct risk | Fix in follow-up; log as tech debt |

## Report Format

```
Agent Config Security Audit — <project>/<date>

P0 findings:
  [P0] <file>:<line> — <description>
       Fix: <what to change>

P1 findings:
  [P1] <file>:<line> — <description>
       Fix: <what to change>

Notes:
  [Note] <file> — <description>

Summary: <N> P0, <N> P1, <N> Notes
```

If no findings: state "No findings." explicitly.
