---
description: Audit agent configuration files for security vulnerabilities and misconfigurations. Classifies findings as P0 or P1.
---

# /security-audit — Agent Config Security Audit

Scan agent configuration files for security issues. Run before committing config changes.

## Usage

`/security-audit [path|.] [--min-severity p0|p1|note]`

- Default target: current directory (`.`)
- `--min-severity`: filter output to findings at or above this level

## Scope

Scan every config file found under the target path:

| File | What to check |
|------|--------------|
| `.claude/settings.json` | Wildcard allow lists, missing deny lists |
| `.mcp.json` | Hardcoded secrets, unpinned `npx -y`, missing descriptions |
| `.codex/config.toml` | Same as MCP checks for Codex config |
| `AGENTS.md`, `CLAUDE.md` | Auto-run instructions, prompt injection patterns, missing prohibitions |
| `hooks/` | Command injection via interpolation, outbound network calls, silent error suppression |
| `plugins/*/plugin.json` | Overly broad tool grants |
| `.apx/relay/` | Secrets in relay artifact files |

## Classification

| Level | Definition |
|-------|-----------|
| **P0** | Direct security risk or secret leak — fix before any commit |
| **P1** | Weakened safety controls or increased attack surface — fix before merging |
| **Note** | Best practice gap with no direct risk — log and fix in follow-up |

## Required Output

```
Security Audit — <path>

P0:
  [P0] <file>:<location> — <description>
       Fix: <instruction>

P1:
  [P1] <file>:<location> — <description>
       Fix: <instruction>

Notes:
  [Note] <file> — <description>

Summary: <N> P0, <N> P1, <N> Notes
```

If no findings, state `No findings.` explicitly — do not omit the summary line.

## Arguments

$ARGUMENTS:
- `[path|.]` — target path (default: `.`)
- `--min-severity p0|p1|note` — minimum severity to include in output
