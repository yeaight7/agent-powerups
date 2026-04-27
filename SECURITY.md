# Security

## What Agent Powerups Is

Agent Powerups is a collection of text-based instructions for coding agents. Skills are Markdown files. They do not execute code, make network requests, or modify systems on their own.

## What Agent Powerups Is Not

- Not a CLI tool
- Not an agent runtime
- Not a service or API

## Threat Model

The security risk in agent powerups comes from what agents DO when following instructions, not from the instructions themselves.

**Trust the agent, not the skill.** A skill that says "delete files" only causes deletion if the agent has permission to delete files and a human (or automated system) has authorized that action. Skills cannot escalate permissions.

## Content Policy

Every asset in this repository must follow these rules:

| Rule | Rationale |
|------|-----------|
| No tokens or API keys | Credentials in version control are a supply chain risk |
| No machine-specific paths | Breaks portability; could leak system layout |
| No personal information | User data belongs nowhere near a public repo |
| No destructive-only workflows | Skills may describe irreversible operations, but must warn clearly |
| No detection evasion techniques | Skills must not help agents evade security tooling |

## Reporting Vulnerabilities

If you find content in this repository that:
- Contains a real credential or token
- Could be used to cause unintended harm when followed by an agent
- Encourages agents to bypass security controls

Please open a GitHub issue with the label `security` or contact the maintainers directly. Do not include the sensitive content in a public issue if it contains real credentials.

## Safe Deployment

When using skills in an automated or high-trust context:

1. **Review before deploying** — Read the skill. Understand what the agent will do.
2. **Apply least privilege** — Give the agent only the permissions it needs for its tasks.
3. **Audit agent actions** — Log what the agent does, especially for skills that modify files or call external tools.
4. **Test in a sandbox first** — Run new skills in a non-production environment before live use.

## Supply Chain

All contributions go through pull request review. No assets are auto-published. There are no build steps, compiled artifacts, or external dependencies in this repository.
