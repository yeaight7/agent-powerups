# session-context-restore

**Type:** SessionStart hook recipe — review before use, not auto-applied.

## Purpose

Give the agent a head start at the beginning of each session by surfacing relevant prior context: recent plans, active tasks, last known work state, and any memory notes. Prevents the agent from starting cold and asking "what were we working on?" every session.

## Trigger Suggestion

```
SessionStart → always run
```

## Check Procedure

When triggered at session start:

1. **Check for memory files** — look for `.remember/now.md`, `.remember/today-*.md`, or similar session notes.
2. **Check for active plans** — look for `docs/specs/`, `docs/plans/`, or files named `*.plan.md`.
3. **Check for uncommitted changes** — run `git status --short` to surface in-progress work.
4. **Check for recent commits** — run `git log --oneline -5` to show what was last done.
5. **Print a compact summary** — show the agent what context was restored so it can orient quickly.

## Suggested Shell Hook

```bash
#!/usr/bin/env bash

echo "=== Session Context ==="

# Recent memory
if [ -f ".remember/now.md" ]; then
  echo "--- Recent Notes ---"
  cat .remember/now.md | head -30
fi

# Uncommitted work
if git rev-parse --is-inside-work-tree &>/dev/null; then
  STATUS=$(git status --short 2>/dev/null)
  if [ -n "$STATUS" ]; then
    echo "--- Uncommitted Changes ---"
    echo "$STATUS"
  fi

  echo "--- Last 5 Commits ---"
  git log --oneline -5 2>/dev/null || true
fi

# Active plans
PLANS=$(find . -name "*.plan.md" -not -path "./.worktrees/*" 2>/dev/null | head -3)
if [ -n "$PLANS" ]; then
  echo "--- Active Plans ---"
  echo "$PLANS"
fi

echo "======================"
```

## Customization

Adapt the hook to your project's memory format. Common variants:

- **Claude Code memory:** read `~/.claude/projects/<hash>/memory/*.md`
- **CLAUDE.md-based context:** `cat CLAUDE.md | head -50`
- **Task tracking:** read `TODO.md` or `.tasks/` directory

## Safety Notes

- Keep this hook fast — it runs on every session start. Avoid network calls or slow file scans.
- Do not print secrets or tokens from `.env` files even if they're present in the directory.
- If no context is found, print nothing — don't fail noisily.

## Failure Mode

Without this hook, agents start each session from scratch, wasting the first few turns on orientation questions and re-reading files that were already summarized in prior sessions.
