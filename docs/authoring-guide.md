# Authoring Guide

This guide explains how to write high-quality skills and other assets for Agent Powerups.

## Skill Structure

```
skills/<skill-name>/
├── SKILL.md          ← required entry point
├── references/       ← supporting docs, scripts, templates
└── examples/         ← usage examples and sample output
```

## SKILL.md Requirements

### Frontmatter

```yaml
---
name: <skill-name>
description: <one sentence — this is what agents use to decide when to trigger>
---
```

The description is critical. It is the text an agent reads to decide whether this skill applies to the current situation. Write it as a trigger condition: "Use when X", "Apply after Y".

### Required Sections

Every `SKILL.md` must have all seven sections in this order:

```markdown
## Purpose
## When to Use
## Inputs
## Workflow
## Output
## Verification
## Failure Modes
```

**Purpose** — One paragraph. What it does and why it exists. Not a sales pitch.

**When to Use** — Specific conditions. Include "When NOT to use" if there are common misapplications.

**Inputs** — What the agent needs to start. Be specific: file path, git range, URL, description.

**Workflow** — Numbered steps. Precise enough that anyone can follow them without guessing. Code blocks for commands. Exact expected output for verification steps.

**Output** — What the result looks like. Include format (Markdown, JSON, plain text) and structure.

**Verification** — A checkbox list the agent uses to confirm the skill completed correctly. At least 3 items.

**Failure Modes** — What goes wrong and what to do. Describe the failure, not just that failure is possible.

### What to Avoid

**Vague motivational text.** "Be a thoughtful engineer" is not actionable. Remove it.

**Excessive caveats.** "You may want to consider potentially..." wastes tokens without adding information.

**Cross-skill duplication.** If `systematic-debugging` already covers root cause tracing, reference it — do not copy the text.

**Placeholders.** "TBD", "implement later", "add appropriate handling" are plan failures in a skill that is supposed to be complete.

**Agent-specific syntax in generic skills.** If your skill uses Claude Code's `Agent` tool or Codex-specific commands, put it in the `claude-code/` or `codex/` subdirectory, not in the root skill.

## References and Examples

Long reference material (reference implementations, supporting scripts, template files) belongs in `references/`. The main `SKILL.md` references them by path.

Usage examples belong in `examples/`. Named descriptively: `condition-based-waiting-example.ts`, not `example.ts`.

## Catalog Entry

Every asset needs a catalog entry in `catalog.json`:

```json
{
  "name": "skill-name",
  "type": "skill",
  "summary": "One sentence. What it does.",
  "path": "skills/skill-name",
  "compatible_with": ["claude-code", "codex", "generic"],
  "tags": ["tag1", "tag2"],
  "maturity": "draft"
}
```

Use real compatibility (`compatible_with`). If you have not tested a platform, leave it out.

Use `maturity` honestly:
- `draft` — you wrote it and it works for you
- `beta` — tested on at least one real project
- `stable` — tested across multiple projects and platforms with no significant issues

## Writing Good Descriptions

The description field is used by agents to auto-trigger skills. Write it to match the exact moment an agent should start using this skill:

Good: `"Use when receiving code review feedback, before implementing suggestions."`

Bad: `"A skill for handling code reviews."` (too vague)

Bad: `"Use this skill to receive code reviews with technical rigor and proper validation because agents tend to blindly implement feedback without..."` (too long)

## Validation

Before submitting:

```bash
python scripts/validate-skills.py
python scripts/validate-catalog.py
```

Fix every error. Warnings are advisory.
