---
name: search-before-building
description: Check existing repo capability, external libraries, MCP options, and maintenance risk before writing custom code. Decide adopt/wrap/build with explicit criteria.
---

# Search Before Building

Before implementing new functionality, verify it does not already exist and that the best option has been considered.

## When to Use

- About to add a new helper, utility, or abstraction
- Task says "add X" and X sounds like a solved problem
- Considering a new external dependency
- Agent proposes writing something from scratch without checking first

## Four-Step Check

Run in order. Stop when you find a satisfactory answer.

### Step 1 — Repo-first

Search the current codebase before anything else:

```bash
rg "<keyword>" src/ lib/ --type ts --type js -l
rg "<keyword>" --glob "*.py" -l
```

Check: Does equivalent logic already exist? Is it importable as-is, or would it need wrapper work?

### Step 2 — Package registry

Search the relevant registry for the project language:

| Language | Registry | Search method |
|----------|----------|---------------|
| TypeScript/JS | npm | `npm search <keyword>` or npmjs.com |
| Python | PyPI | `pip index search <keyword>` or pypi.org |
| Go | pkg.go.dev | web search `site:pkg.go.dev <keyword>` |
| Rust | crates.io | `cargo search <keyword>` |

Score each candidate:
- Maintenance: last commit < 1 year, open issues ratio
- Popularity: weekly downloads or GitHub stars
- License: MIT / Apache-2.0 / BSD preferred; check for GPL/commercial constraints
- Size: avoid heavy packages for a single feature

### Step 3 — MCP / tool servers

Check whether an MCP server already provides this capability:

```bash
# List currently configured MCP servers
cat .mcp.json 2>/dev/null || cat ~/.claude/settings.json | grep -A5 '"mcpServers"'
```

Check the Agent Powerups catalog for MCP configs:
```bash
apx list --type mcp-config
```

If a server covers the need, prefer configuring it over writing code.

### Step 4 — Maintenance and license risk

Before adopting a package, verify:
- [ ] Not abandoned (last release within 18 months)
- [ ] License compatible with this project
- [ ] No known critical CVEs (`npm audit` / `pip-audit` / `cargo audit`)
- [ ] Dependency count is reasonable (< 20 transitive for small utilities)

## Decision

| Finding | Action |
|---------|--------|
| Exact match in repo | **Reuse** — import and use; refactor only if the interface is incompatible |
| Exact external match, acceptable risk | **Adopt** — install and use directly; do not wrap unless the API is hostile |
| Partial match | **Wrap** — install, write a thin adapter; keep the adapter < 50 lines |
| Multiple weak matches | **Compose** — combine 2–3 small packages; document why |
| No suitable option | **Build** — write custom code; document the gap search found |

## Constraint: Do Not Skip

This check is mandatory before:
- Writing any utility over 20 lines that solves a generic problem
- Adding a new external dependency
- Configuring a new MCP server

If time-boxed, spend at most 5 minutes on Steps 1–2 before deciding.

## Anti-Patterns

- **Repo-skip**: Writing code without checking if an internal equivalent exists
- **Registry-skip**: Adding a package without checking simpler alternatives
- **Over-wrapping**: Encapsulating a library so heavily that the benefits are lost
- **Dependency bloat**: Pulling in a 5 MB package for a single 10-line feature
