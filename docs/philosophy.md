# Philosophy

## The Problem

Most agent prompts are written once, stay in someone's CLAUDE.md or system prompt, and are never shared. When a developer discovers a better way to prompt an agent to debug systematically, that insight doesn't travel.

The same problem existed for shell configuration a decade ago: every developer had their own bag of aliases and functions, incompatible with everyone else's. Oh My Zsh solved it by creating a shared, composable plugin ecosystem.

Agent Powerups applies the same idea to agent behaviors.

## Design Principles

### 1. Portable by default

A skill written for Claude Code should work in Gemini CLI. A workflow written for Codex should be readable and useful in Cursor. Where agent-specific syntax is needed, it belongs in a platform-specific directory, not in the core asset.

This forces a discipline: write the behavior, not the invocation. The behavior is the portable part.

### 2. Opinionated, not neutral

Agent Powerups takes positions. `systematic-debugging` says you MUST find root cause before proposing fixes — not "consider finding root cause". `safe-refactor` says you MUST have tests before refactoring — not "tests are recommended".

Neutral guidance is useless guidance. Agents need enough signal to override their default behaviors under pressure. Soft suggestions don't do that.

### 3. Self-contained

Each skill is a complete unit. It does not depend on other skills being loaded. It does not assume a specific project structure. It does not require another file to understand.

This makes skills composable without coupling them.

### 4. Honest about maturity

Assets are labeled `draft`, `beta`, or `stable`. Draft means the author wrote it and it works for them. Beta means it's been tested across at least one real project. Stable means it's been tested across multiple projects and platforms.

No asset ships as `stable` without evidence.

### 5. No filler

Every word in a skill costs tokens. Long motivational preambles, excessive caveats, and redundant examples reduce the signal-to-noise ratio. Skills are written to be loaded into context, not read as essays.

## What This Is Not

- Not an agent framework. Agent Powerups doesn't orchestrate agents or manage their state.
- Not a prompt library. Skills describe workflows, not just system prompt instructions.
- Not a replacement for AGENTS.md. AGENTS.md is project-specific. Agent Powerups is portable.
- Not a shortcut for quality. Skills that lower the bar for agent behavior don't belong here.
