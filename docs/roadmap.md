# Roadmap

This is a living document. Priority order reflects what is most useful, not what is easiest.

## Near Term

### AGENTS.md Templates

Templates for common project types, pre-populated with sensible defaults:

- `python-library/` — testing conventions, type checking, release workflow
- `typescript-app/` — build, lint, test, CI
- `dbt-project/` — model structure, testing, documentation standards
- `ml-project/` — experiment tracking, data versioning, model evaluation
- `open-source-maintainer/` — contribution guide, PR review, issue triage

### Hook Library

Event-driven behaviors for agent platforms that support hooks:

- `hooks/safety/` — confirm before destructive operations, check for credentials in diffs
- `hooks/quality/` — run linter after edits, validate test coverage before commit
- `hooks/productivity/` — auto-compact context, summarize session on stop

### Workflow Guides

Multi-step scenario documentation for common engineering situations:

- `workflows/repo-audit.md` — full audit of an unfamiliar codebase
- `workflows/pr-review.md` — systematic PR review from triage to approval
- `workflows/fix-ci.md` — diagnose and fix a failing CI pipeline
- `workflows/release-readiness.md` — pre-release verification checklist

## Medium Term

### Slash Command Library

Platform-specific slash commands for common operations:

- `commands/claude-code/` — Claude Code custom commands
- `commands/codex/` — Codex command definitions
- `commands/generic/` — platform-agnostic command patterns

### MCP Configuration Recipes

Ready-to-use MCP server configurations:

- `mcp/claude-code/` — Claude Code MCP setups
- `mcp/codex/` — Codex MCP setups
- Common MCP servers: GitHub, Slack, linear, databases

### Example Setups

Working example configurations for specific platforms and use cases:

- `examples/minimal/` — bare minimum setup for any agent
- `examples/claude-code/` — full Claude Code setup with skills, hooks, and commands
- `examples/codex/` — Codex setup with equivalent features

## Later

### Skill Versioning

Semantic versioning for skills so projects can pin to specific versions and receive upgrade notices.

### Skill Composition

Patterns for skills that reference or chain into other skills without creating hard dependencies.

### Testing Framework

A lightweight framework for validating that a skill produces the expected behavior given a standardized scenario.

## Not Planned

- Agent orchestration or multi-agent coordination
- A runtime or CLI tool (keep this as a file collection)
- Tight coupling between assets
- Platform lock-in for core skills
