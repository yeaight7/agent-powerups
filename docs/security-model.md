# Security Model

## Assets Are Instructions, Not Code

Every asset in Agent Powerups is a text file. Skills are Markdown. Commands are text. Hooks are configuration references.

None of them execute automatically. They describe behaviors for agents to follow when instructed. The agent executes — the skill just describes what to do.

## Trust Boundary

```
User / Operator
      │
      ▼
   Agent (Claude Code, Codex, etc.)
      │
      ▼
  Skill (text instructions)
      │
      ▼
  Agent actions (file edits, shell commands, API calls)
```

The skill is downstream of both the operator and the agent. It cannot grant permissions the agent does not already have. It cannot instruct the agent to bypass controls the operator has put in place.

## What This Means in Practice

**A skill that says "delete files" only causes deletion if:**
1. The agent has permission to delete files in its environment.
2. The agent follows the skill's instructions.
3. A human or authorized system triggered the agent to run this skill.

**A skill cannot:**
- Escalate agent permissions.
- Bypass operator-set restrictions.
- Execute code without an agent running it.
- Access credentials or secrets not already available to the agent.

## Content Rules

All assets in this repository must follow these rules:

| Rule | Reason |
|------|--------|
| No API keys, tokens, or secrets | Supply chain risk |
| No hardcoded machine-specific paths | Breaks portability; leaks system layout |
| No personal or identifying information | Privacy |
| No detection evasion techniques | Skills must not help agents evade security tooling |
| Destructive operations must include explicit warnings | Users must know before agents act irreversibly |

## Automated Context Risks

When skills are loaded into an agent's context automatically (e.g., via always-on system prompts or hooks), review them carefully:

1. **Scope** — What actions does this skill authorize or encourage?
2. **Triggers** — Under what conditions will the agent follow this skill?
3. **Blast radius** — If the agent follows this skill on the wrong input, what is the worst case?

Skills that perform irreversible actions (file deletion, branch force-push, database changes) should require explicit user confirmation in the workflow step, not just instructions to "proceed if confident".

## Reporting

See `SECURITY.md` at the root for how to report security concerns.
