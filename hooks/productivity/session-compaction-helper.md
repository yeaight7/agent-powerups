# session-compaction-helper

**Type:** PreCompact / PostCompact hook recipe — review before use, not auto-applied.

## Purpose

Preserve critical task state before context compaction and restore it afterward. Prevents loss of in-progress work context — active task, key decisions, open files, and blocker state — when the conversation window is compressed.

This hook complements, but does not duplicate, existing hooks:
- `session-context-restore` — restores session state at the start of a new session.
- `context-compression` skill — provides manual compression workflow.

This hook specifically targets the compaction event within a running session.

## Trigger Suggestion

```
PreCompact → before context compaction
  AND/OR
PostCompact → after context compaction resumes
```

If `PreCompact` / `PostCompact` are not supported by the host agent, use this as a manual pattern triggered by the agent when it detects that context is approaching limits.

## Behavior

### PreCompact: save state

Before compaction, write a compact state snapshot to `.agent-compact-state.md`:

```markdown
## Compact State Snapshot — <ISO timestamp>

**Active task:** <one-line description>
**Current step:** <numbered step or phase>
**Last completed:** <what was just done>
**Next action:** <immediate next step>
**Open files:** <list of files with pending changes>
**Key decisions made:** <brief bulleted list>
**Blockers / open questions:** <list>
**Commands to resume:** <any commands needed to re-check state>
```

Rules:
- No secrets, no file contents — pointers only.
- Keep under 40 lines.
- Overwrite on each PreCompact; only the latest snapshot matters.

### PostCompact: restore state

After compaction, the agent should:

1. Read `.agent-compact-state.md` if it exists.
2. Print a brief resumption summary: "Resuming from compact state: [active task] at [step]."
3. Re-read the most critical open files listed in the snapshot.
4. Continue from "Next action."

## Safe Default

Write-only to `.agent-compact-state.md` (local file). No remote writes. No secrets.

## Blocking vs Warning Mode

- **Non-blocking:** This hook must not interrupt active work. Snapshot writes are silent.
- The PostCompact restore is advisory — agent reads and continues, does not halt.

## False-Positive Risks

- Large snapshots that themselves consume significant context — keep snapshots short.
- Stale snapshots from a previous session — check timestamp before trusting the content.

## Bypass / Approval Mechanism

No approval needed — writes only to a local transient file. Add `.agent-compact-state.md` to `.gitignore`.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# PreCompact variant: write snapshot.
# TASK, STEP, NEXT_ACTION, FILES are set by the agent's hook runner.

SNAPSHOT_FILE="${REPO_ROOT:-.}/.agent-compact-state.md"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > "$SNAPSHOT_FILE" <<EOF
## Compact State Snapshot — $TIMESTAMP

**Active task:** ${TASK:-unknown}
**Current step:** ${STEP:-unknown}
**Next action:** ${NEXT_ACTION:-resume from last known step}
**Open files:** ${FILES:-none listed}
**Key decisions:** ${DECISIONS:-none recorded}
**Blockers:** ${BLOCKERS:-none}
EOF

echo "[session-compaction-helper] State saved to $SNAPSHOT_FILE"
exit 0
```

Add to `.gitignore`:

```gitignore
.agent-compact-state.md
```

## Sources / Inspiration

Pattern derived from Claude Code session compaction behavior and the context-compression skill in this repository. Complements `session-context-restore` (hooks/productivity/session-context-restore.md).
