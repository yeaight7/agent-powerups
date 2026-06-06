---
name: mcp-risk-review
description: Use when an MCP server is about to be enabled, added to agent config, or upgraded -- a staged server config is a candidate for activation, a third-party server is proposed from a registry, or an existing entry changes transport, credentials, or tool surface.
---

## Purpose

Triage the risk of an MCP server before it gains access to the session. An enabled server's tools execute with real filesystem, network, and credential reach; the review happens before enablement, not after the first incident.

## When to Use

- A staged MCP server config is a candidate for enabling
- A third-party MCP server is proposed from outside the repo
- An existing server entry changes transport, credentials, or tool surface
- A long-enabled server is due a periodic re-review

For filesystem-server path boundaries in depth, continue with the filesystem-mcp-guardrails skill after this triage.

## Inputs

- The server config entry: command, args, env, transport
- The server's declared tool list (from its manifest or a smoke run)
- What the session can reach if the server misbehaves

## Workflow

1. **Launch vector.** Pinned, locally installed binaries beat remote latest-version execution:

   ```sh
   rg -n 'npx -y|@latest|curl .*\| *sh' <config-file>
   ```

   Unpinned remote execution is a P1 by default — the server reviewed today is not necessarily the server that runs tomorrow.

2. **Transport and exposure.** A local stdio process is the conservative default. Network transports must answer: who can connect, is it loopback-only, is there authentication.

3. **Credentials and environment.** Hardcoded secrets in the config are P0. Environment pass-through should name specific variables — never forward the whole environment.

4. **Tool surface.** Enumerate the tools the server actually declares. Write, exec, and delete capabilities raise the bar; a read-only server with three tools is a different risk class from a shell-capable one with thirty.

5. **Scope boundaries.** Paths bounded to the workspace, method filtering configured, timeouts set.

6. **Repo-native checks, then approval.** For staged Agent Powerups configs, run the availability checks, then stop for explicit user approval before enabling:

   ```sh
   apx mcp check <name>
   apx mcp smoke <name>
   ```

   These verify availability and declared dependencies only — they are not a substitute for the review above, and passing them does not authorize enablement.

## Output

- A risk verdict: enable, constrain-then-enable, or reject
- Findings with level (P0 secret or unbounded exec, P1 unpinned or over-broad, Note) and a concrete remediation each
- Unanswered questions stated as open risks when information was unavailable

## Verification

- [ ] Launch vector, transport, credentials, tool surface, and boundaries were each explicitly assessed
- [ ] The tool list came from the server's actual declaration, not an assumption
- [ ] Availability checks were run for staged configs
- [ ] No server was enabled without explicit user approval after the verdict

## Failure Modes

- **Smoke-test-as-review** — a passing smoke run proves the server starts, not that it is safe.
- **Trusting the README tool list** — enumerate from the server's declared tools; docs drift.
- **Wildcard env pass-through** — handing the whole environment to a subprocess leaks every credential the session holds.
- **Enable-then-review** — once tools are live, the first malicious call has already happened.
