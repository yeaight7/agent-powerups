# Agent Powerups

**Oh My Zsh for coding agents.**

Reusable skills, slash commands, MCP configs, hooks, AGENTS.md templates, and workflows for serious software engineering — across Claude Code, Codex, Gemini CLI, Cursor, and any agent that follows text instructions.

---

## What Is This?

Agent Powerups is a curated, portable collection of agent behaviors. Think of it as a plugin library: pick what you need, drop it into your agent setup, and your agent works better immediately.

Every asset is:
- **Self-contained** — no hidden dependencies between assets
- **Agent-portable** — written for any instruction-following agent unless explicitly tagged otherwise
- **Opinionated** — designed for serious engineering, not demos

---

## What's Included

| Type | What | Examples |
|------|------|---------|
| `skills/` | Procedural workflows agents follow | `systematic-debugging`, `writing-plans`, `ai-slop-cleaner` |
| `commands/` | Slash commands and agent commands | *(coming)* |
| `mcp/` | MCP server configurations | *(coming)* |
| `hooks/` | Event-driven agent triggers | *(coming)* |
| `agents-md/` | AGENTS.md templates by project type | *(coming)* |
| `workflows/` | Multi-step scenario guides | *(coming)* |
| `examples/` | Example setups for specific platforms | *(coming)* |

---

## Quickstart

### Using a skill in Claude Code

Copy the skill folder into your Claude plugins directory:

```bash
cp -r skills/systematic-debugging ~/.claude/skills/
```

Then invoke it:
```
/systematic-debugging
```

### Using a skill in any agent

Copy the contents of `skills/<name>/SKILL.md` into your agent's system prompt or context, or reference it by path in your agent configuration.

### Browsing the catalog

All assets are indexed in [`catalog.json`](./catalog.json). Every entry includes compatibility, tags, and maturity.

---

## Current Skills

| Skill | What It Does | Maturity |
|-------|-------------|---------|
| `systematic-debugging` | Enforces root-cause investigation before any fix | stable |
| `no-fluff` | Ultra-compressed communication mode (~75% token reduction) | stable |
| `writing-plans` | Turns specs into executable multi-step implementation plans | beta |
| `ai-slop-cleaner` | Reduces AI-generated bloat through smell-by-smell cleanup | beta |
| `requesting-code-review` | Dispatches a focused code-reviewer before merging | beta |
| `receiving-code-review` | Evaluates feedback with technical rigor before implementing | beta |
| `pr-triage` | Identifies the PRs that most deserve attention now | beta |
| `repo-map` | Produces an architecture overview of an unfamiliar codebase | beta |
| `bug-hunt` | Reproduces, isolates, and fixes a bug with minimal scope | beta |
| `safe-refactor` | Restructures code without changing observable behavior | beta |
| `defuddle` | Extracts clean markdown from web pages (requires Defuddle CLI) | beta |
| `markitdown-file-intake` | Converts files to Markdown before inspection | draft |

---

## Compatibility Matrix

| Asset | Claude Code | Codex | Gemini CLI | Cursor | Generic |
|-------|:-----------:|:-----:|:----------:|:------:|:-------:|
| Skills (text-based) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Skills (tool-specific) | varies | varies | varies | varies | varies |
| Commands | by platform | by platform | — | — | — |
| MCP configs | ✅ | ✅ | ✅ | — | — |

See [`docs/compatibility.md`](./docs/compatibility.md) for detailed compatibility notes per asset.

---

## Safety

Agent Powerups does not:
- Include tokens, API keys, or credentials
- Hardcode machine-specific paths
- Make external network requests
- Execute code automatically

Skills are text-based instructions. They only do what your agent does when following them. Review any skill before deploying it in an automated or high-trust context.

See [`SECURITY.md`](./SECURITY.md) and [`docs/security-model.md`](./docs/security-model.md) for the full security model.

---

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for how to add or improve assets.

Short version:
1. Follow the structure in `docs/authoring-guide.md`
2. Skills must have YAML frontmatter with `name` and `description`
3. Run `python scripts/validate-skills.py` and `python scripts/validate-catalog.py`
4. Open a pull request

---

## Roadmap

See [`docs/roadmap.md`](./docs/roadmap.md) for planned additions.

Short version:
- AGENTS.md templates for common project types
- Hook library (safety, quality, productivity)
- Slash command library (Claude Code, Codex)
- MCP configuration recipes
- Workflow guides for common engineering scenarios
