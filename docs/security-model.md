# Security Model

Agent Powerups is a repository of instructions and helper metadata. Risk comes from what an agent is allowed to do after loading those instructions.

## Core Boundary

- Skills are text.
- Catalog entries are metadata.
- Scripts are executable code and should be inspected before running.
- Hooks can execute code if the host agent supports hooks.
- MCP configs can grant new tool or network access.

## Practical Warnings

- Hooks can execute code.
- MCP configs can grant tool access.
- Install scripts and install commands can modify the local environment.
- Skills may process local files or direct an agent to do so.
- Secrets should not be pasted into agent context unless strictly necessary.
- Users should inspect assets before installing or running them.

## Safe Use

1. Read the asset before enabling it.
2. Apply least privilege to the agent runtime.
3. Check optional tool requirements before installing anything.
4. Prefer sandbox or non-production environments for first use.
5. Audit what the agent actually did, not what the asset promised.

## Content Rules

Assets in this repo should not include:

- API keys, tokens, or credentials
- hardcoded machine-specific paths
- personal data
- stealthy or destructive automation
- instructions to bypass security controls

## Reporting

Security concerns belong in [`SECURITY.md`](../SECURITY.md).
