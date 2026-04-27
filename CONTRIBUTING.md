# Contributing to Agent Powerups

Thank you for contributing. This document explains what makes a good contribution and how to get yours merged.

---

## Principles

**Quality over quantity.** One well-crafted skill is worth more than ten thin ones. Every asset should solve a real engineering problem that agents commonly encounter.

**Portable by default.** Unless an asset explicitly targets a specific agent platform, it should work with any agent that follows text instructions. Avoid platform-specific syntax unless it belongs in a platform-specific directory.

**No fake claims.** If a skill requires a specific tool (Defuddle, MarkItDown, `gh`), say so clearly. Do not claim compatibility with a platform you haven't tested.

**No secrets.** Never include tokens, API keys, machine-specific paths, credentials, or personal information.

---

## Asset Types

| Directory | What Goes Here |
|-----------|---------------|
| `skills/` | Procedural workflows an agent follows |
| `commands/` | Slash commands organized by platform (`claude-code/`, `codex/`, `generic/`) |
| `mcp/` | MCP server configurations by platform |
| `hooks/` | Event-driven triggers by category (`safety/`, `quality/`, `productivity/`) |
| `agents-md/` | AGENTS.md templates by project type |
| `workflows/` | Multi-step scenario guides (Markdown) |
| `examples/` | Working example setups by platform |

---

## Adding a Skill

### Required structure

```
skills/<skill-name>/
├── SKILL.md          ← required
├── references/       ← optional: supporting docs, scripts, prompts
└── examples/         ← optional: usage examples
```

### Required frontmatter

```yaml
---
name: <skill-name>
description: <one sentence — used by agents to decide when to trigger this skill>
---
```

### Required sections in SKILL.md

1. **Purpose** — What it does and why it exists.
2. **When to Use** — Conditions that trigger this skill. Include when NOT to use.
3. **Inputs** — What the agent needs to execute this skill.
4. **Workflow** — Numbered steps. Precise enough to follow without guessing.
5. **Output** — What the result looks like (format, structure).
6. **Verification** — Checkbox list the agent uses to confirm it did the skill correctly.
7. **Failure Modes** — What goes wrong and how to handle it.

### What to avoid

- Vague motivational text ("be a great engineer!")
- Duplicating instructions already in another skill — reference instead
- Placeholders ("TBD", "implement this later")
- More than one skill's worth of content in a single SKILL.md — split if needed

---

## Updating catalog.json

Every asset must have a catalog entry. Add an object to `catalog.json`:

```json
{
  "name": "skill-name",
  "type": "skill",
  "summary": "One sentence what it does.",
  "path": "skills/skill-name",
  "compatible_with": ["claude-code", "codex", "generic"],
  "tags": ["debugging", "methodology"],
  "maturity": "draft"
}
```

**Allowed types:** `skill`, `command`, `mcp-config`, `agents-md-template`, `hook`, `workflow`, `example`

**Allowed maturity:** `draft` (untested), `beta` (tested by author), `stable` (tested across platforms/projects)

---

## Validation

Run both validation scripts before opening a pull request:

```bash
python scripts/validate-skills.py
python scripts/validate-catalog.py
```

Both scripts exit with code 0 on success and print errors on failure.

---

## Pull Request Checklist

- [ ] Skill folder has `SKILL.md` with YAML frontmatter (`name`, `description`)
- [ ] All seven required sections present in `SKILL.md`
- [ ] No hardcoded paths, tokens, or machine-specific content
- [ ] `catalog.json` entry added or updated
- [ ] Both validation scripts pass
- [ ] Compatibility claims are accurate (tested or clearly noted as untested)
