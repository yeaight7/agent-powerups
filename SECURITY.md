# Security

Agent Powerups ships instructions, metadata, and helper scripts. The risk surface comes from what an agent can do after loading them.

## High-Level Rules

- Review assets before enabling them.
- Do not trust compatibility claims blindly.
- Do not run install commands or scripts without understanding their effect.
- Give agents least privilege.

## Repository Content Rules

This repo should not contain:

- tokens, API keys, or credentials
- machine-specific paths
- personal or customer data
- destructive-only automation
- instructions to bypass security controls

## Operational Warnings

- Hooks may execute code.
- MCP configs may expand tool access.
- Skills may direct an agent to read local files or run commands.
- Install commands can modify the local environment.

More detail: [`docs/security-model.md`](./docs/security-model.md)

## Reporting

If you find sensitive content or dangerous instructions, open a private maintainer contact or a GitHub issue without posting the sensitive material itself.
