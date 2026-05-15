# session-lifecycle-state

**Type:** SessionStart / SessionEnd hook recipe — review before use, not auto-applied.

## Purpose

Persist a compact state snapshot at session end and restore relevant context at session start. Provides continuity across sessions without duplicating the per-tool-call logging of `session-log`, the in-session compaction handling of `session-compaction-helper`, or the manual restore flow of `session-context-restore`.

This hook specifically targets the session lifecycle boundary: what was happening when the session ended, and what the next session should know immediately on startup.

## Trigger Suggestion

```
SessionStart → session begins
SessionEnd → session ends (if supported by the host client)
```

If `SessionEnd` is not supported: trigger the save step on `Stop` instead.

## Matcher Patterns

No command or file pattern matching required. Triggers on lifecycle events only.

## Behavior

### SessionEnd (or Stop fallback): save state

Write a compact snapshot to `.agent-session-state.md` in the repo root:

```markdown
## Session State — <ISO timestamp>

**Repo:** <repo name or path>
**Branch:** <current git branch>
**Active task:** <one-line description of what was being worked on>
**Last action:** <last file written, command run, or decision made>
**Status:** <complete / in-progress / blocked>
**Open files with changes:** <list of modified but uncommitted files>
**Next session start:** <recommended first action for the next session>
**Warnings / blockers:** <anything the next session must know>
```

Rules:
- No secrets, tokens, or credential values — pointers only.
- No file contents — only file paths and change descriptions.
- Keep under 30 lines.
- Overwrite on each SessionEnd; only the latest snapshot matters.

### SessionStart: restore context

At session start:

1. Check if `.agent-session-state.md` exists.
2. If it exists and the timestamp is within the configured retention window (default: 24 hours):
   - Print: `[session-lifecycle-state] Restoring session context from <timestamp>:`
   - Print the Active task, Status, Last action, and Next session start fields.
   - Re-read the listed open files if they still exist and have uncommitted changes.
3. If the snapshot is older than the retention window: ignore it (may be stale) and print a note.
4. If no snapshot exists: proceed normally without disruption.

## Safe Default

- Write-only to `.agent-session-state.md` (local file). No remote writes. No secrets.
- SessionStart restore is advisory — agent reads context and continues; does not halt.
- 24-hour retention window by default. Adjust to match your workflow cadence.

## Blocking vs Warning Mode

- **Non-blocking:** This hook must not interrupt work. State writes are silent.
- Restore on startup prints a brief summary only. Agent decides whether to act on it.

## False-Positive Risks

- Stale snapshots from abandoned sessions that do not apply to the current task.
- Short-lived sessions (< 5 minutes) where state snapshots add noise without value.

Mitigate by checking the snapshot timestamp and task description before acting on it.

## Bypass / Approval Mechanism

No approval needed. Writes only to a local transient file. Add `.agent-session-state.md` to `.gitignore`.

## Relationship to Existing Hooks

| Hook | Scope |
|---|---|
| `session-context-restore` | Manual restore from a structured context file |
| `session-log` | Per-tool-call event logging throughout the session |
| `session-compaction-helper` | State save/restore around context compaction events |
| **session-lifecycle-state** | Session boundary: save at end, restore at start |

Do not duplicate content from the above hooks. This hook manages only the start/end lifecycle boundary.

## Gitignore Entry

Add to `.gitignore`:

```gitignore
.agent-session-state.md
```

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# SessionEnd variant: write snapshot.
# TASK, BRANCH, LAST_ACTION, STATUS, OPEN_FILES, NEXT_START are set by the agent's hook runner.

SNAPSHOT_FILE="${REPO_ROOT:-.}/.agent-session-state.md"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > "$SNAPSHOT_FILE" <<EOF
## Session State — $TIMESTAMP

**Repo:** ${REPO_ROOT:-.}
**Branch:** ${BRANCH:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)}
**Active task:** ${TASK:-unknown}
**Last action:** ${LAST_ACTION:-unknown}
**Status:** ${STATUS:-unknown}
**Open files with changes:** ${OPEN_FILES:-none}
**Next session start:** ${NEXT_START:-resume from last known state}
**Warnings / blockers:** ${BLOCKERS:-none}
EOF

echo "[session-lifecycle-state] State saved to $SNAPSHOT_FILE"
exit 0
```

```bash
#!/usr/bin/env bash
# SessionStart variant: restore context.

SNAPSHOT_FILE="${REPO_ROOT:-.}/.agent-session-state.md"
MAX_AGE_HOURS=24

if [ ! -f "$SNAPSHOT_FILE" ]; then
  exit 0
fi

# Check age (requires GNU date or compatible)
SNAPSHOT_TIME=$(grep "## Session State" "$SNAPSHOT_FILE" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9:]+Z' | head -1)
if [ -n "$SNAPSHOT_TIME" ]; then
  SNAPSHOT_EPOCH=$(date -u -d "$SNAPSHOT_TIME" +%s 2>/dev/null || echo 0)
  NOW_EPOCH=$(date -u +%s)
  AGE_HOURS=$(( (NOW_EPOCH - SNAPSHOT_EPOCH) / 3600 ))
  if [ "$AGE_HOURS" -gt "$MAX_AGE_HOURS" ]; then
    echo "[session-lifecycle-state] Snapshot is ${AGE_HOURS}h old — skipping restore."
    exit 0
  fi
fi

echo "[session-lifecycle-state] Restoring session context:"
grep -E "^(\*\*Active task|\*\*Status|\*\*Last action|\*\*Next session start):" "$SNAPSHOT_FILE"
exit 0
```

## Sources / Inspiration

Session lifecycle patterns from Claude Code session tooling documentation. Complements `session-context-restore`, `session-log`, and `session-compaction-helper` in this repository.
