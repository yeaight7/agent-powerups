---
name: writing-skills
description: Use when creating new skills, editing existing skills, or verifying skills work before deployment
---

# Writing Skills

## Overview

**Writing skills IS Test-Driven Development applied to process documentation.**

You write test cases (pressure scenarios with subagents), watch them fail (baseline behavior), write the skill (documentation), watch tests pass (agents comply), and refactor (close loopholes).

**Core principle:** If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing.

## What is a Skill?

A **skill** is a reference guide for proven techniques, patterns, or tools. Skills help future agent instances find and apply effective approaches.

**Skills are:** Reusable techniques, patterns, tools, reference guides

**Skills are NOT:** Narratives about how you solved a problem once

## SKILL.md Structure

**Frontmatter (YAML):**
- Two required fields: `name` and `description`
- `name`: Use letters, numbers, and hyphens only
- `description`: Third-person, describes ONLY when to use (NOT what it does)
  - Start with "Use when..." to focus on triggering conditions
  - Include specific symptoms, situations, and contexts
  - **NEVER summarize the skill's process or workflow**
  - Keep under 500 characters if possible

```markdown
---
name: skill-name-with-hyphens
description: Use when [specific triggering conditions and symptoms]
---

# Skill Name

## Overview
What is this? Core principle in 1-2 sentences.

## When to Use
Bullet list with SYMPTOMS and use cases / When NOT to use

## Core Pattern
Before/after comparison or step-by-step

## Quick Reference
Table or bullets for scanning common operations

## Common Mistakes
What goes wrong + fixes
```

## Claude Search Optimization (CSO)

**Critical:** The description field must help agents decide whether to load the skill. It should ONLY describe triggering conditions — never summarize the workflow.

```yaml
# BAD: Summarizes workflow - agent may follow this instead of reading the full skill
description: Use when executing plans - dispatches subagent per task with review between tasks

# GOOD: Just triggering conditions
description: Use when executing implementation plans with independent tasks
```

**Why this matters:** When a description summarizes the skill's workflow, agents may follow the description instead of reading the full skill content.

## File Organization

```
skills/
  skill-name/
    SKILL.md              # Main reference (required)
    supporting-file.*     # Only if needed (heavy reference, scripts)
```

**Keep inline:** Principles, concepts, code patterns under 50 lines, everything else.

**Separate files for:** API docs/reference over 100 lines, reusable scripts/utilities.

## The Iron Law

```
NO SKILL WITHOUT A FAILING TEST FIRST
```

This applies to NEW skills AND EDITS to existing skills.

## RED-GREEN-REFACTOR for Skills

| TDD Concept | Skill Creation |
|-------------|----------------|
| Test case | Pressure scenario with subagent |
| RED | Agent violates rule without skill (baseline) |
| GREEN | Agent complies with skill present |
| REFACTOR | Close loopholes while maintaining compliance |

### RED: Write Failing Test (Baseline)

Run pressure scenario WITHOUT the skill. Document exact behavior:
- What choices did they make?
- What rationalizations did they use (verbatim)?

### GREEN: Write Minimal Skill

Write skill addressing those specific rationalizations. Don't add extra content for hypothetical cases. Verify agent now complies.

### REFACTOR: Close Loopholes

Agent found new rationalization? Add explicit counter. Re-test until bulletproof.

## Skill Creation Checklist

**RED Phase:**
- [ ] Run baseline scenario WITHOUT skill — document violations verbatim

**GREEN Phase:**
- [ ] `name` uses only letters, numbers, hyphens
- [ ] YAML frontmatter with `name` and `description`
- [ ] Description starts with "Use when..." — no workflow summary
- [ ] Keywords throughout for discovery
- [ ] Clear overview with core principle
- [ ] Run scenarios WITH skill — verify compliance

**REFACTOR Phase:**
- [ ] Identify new rationalizations from testing
- [ ] Add explicit counters for discipline skills
- [ ] Build rationalization table

## Common Mistakes

| Anti-Pattern | Why Bad |
|---|---|
| Narrative storytelling | Too specific, not reusable |
| Multi-language examples | Mediocre quality, maintenance burden |
| Generic labels (step1, helper2) | No semantic meaning |
| Description summarizing workflow | Agent follows description, skips full skill |

## When to Create a Skill

**Create when:**
- Technique wasn't intuitively obvious
- You'd reference this again across projects
- Pattern applies broadly (not project-specific)

**Don't create for:**
- One-off solutions
- Standard practices documented elsewhere
- Project-specific conventions (put in CLAUDE.md instead)
