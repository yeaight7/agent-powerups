# handoff-completeness-check

**Type:** Stop hook recipe — review before use, not auto-applied.

## Purpose

Before the agent emits a final response or stops work, verify the handoff contains enough information for the next agent, developer, or session to continue. Catches incomplete handoffs where the agent claims completion but has not summarized what changed, what was validated, or what is left to do.

This hook complements `handoff-summary` (which generates the summary) and `validation-required` (which checks validation was run). It does not duplicate their text; it checks for the presence of the required elements.

## Trigger Suggestion

```
Stop → agent is about to emit a final response
  OR → agent has just completed a task and is about to end the turn
```

## Matcher Patterns

Trigger when the agent:

- Is about to call `Stop` or equivalent completion signal.
- Has just written output containing "done", "complete", "finished", "implemented", "fixed", "all tasks complete", or similar completion claims.

## Behavior

When a Stop or completion claim is detected:

1. Print: `[handoff-completeness-check] Checking handoff completeness...`
2. Score against the checklist:

```
HANDOFF COMPLETENESS CHECK:

[ ] What changed — list of files or systems modified
[ ] Files touched — explicit file paths, not just "several files"
[ ] Validation run — at least one validation command executed and passed
[ ] Failures or skipped checks — any known failures noted or explained
[ ] Risks / TODOs — open issues, known limitations, or follow-up items
[ ] Next steps (if applicable) — what the next agent/session should do first
```

3. If 4 or more items are present: print `PASS — handoff is sufficiently complete.` and exit 0.
4. If fewer than 4 items are present: print the missing items and exit with a warning or block.

## Safe Default

Warning only. Most completion summaries cover the basics; hard blocking would create friction for simple tasks.

Enable blocking in strict mode for workflows where handoff quality is critical (e.g., multi-agent pipelines, long-running agentic workflows).

## Blocking vs Warning Mode

- **Warning (recommended):** Print missing checklist items; allow completion.
- **Blocking:** Require at least 4/6 items before allowing the Stop signal to proceed.

## False-Positive Risks

- Trivial tasks where a full handoff is genuinely unnecessary (e.g., a one-line fix, a doc typo).
- Tasks where no validation is meaningful (e.g., renaming a variable, adding a comment).

Consider adding a threshold: skip the check if the total diff is under 5 lines.

## Bypass / Approval Mechanism

Agent explicitly marks the task as trivial with a note: "Handoff check bypassed — single-line change, no validation needed." User can confirm. In warning mode, no bypass is required.

## Relationship to Existing Hooks

- `handoff-summary` (`hooks/productivity/handoff-summary.md`) — generates the summary content.
- `validation-required` (`hooks/quality/validation-required.md`) — checks validation was run.
- This hook checks that the summary is present and complete. It does not generate content.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# Called just before agent emits final response.
# $AGENT_OUTPUT contains the draft final response text.

SCORE=0
MISSING=()

check() {
  local label="$1"
  local pattern="$2"
  if echo "$AGENT_OUTPUT" | grep -qiE "$pattern"; then
    SCORE=$((SCORE + 1))
  else
    MISSING+=("$label")
  fi
}

check "what changed"        "(changed|modified|updated|added|removed|created)"
check "files touched"       "(\.ts|\.py|\.go|\.rs|\.json|\.yaml|\.md|src/|lib/|app/)"
check "validation run"      "(test|lint|typecheck|validate|build|pass|fail)"
check "failures noted"      "(fail|error|skip|known|TODO|FIXME|warn)"
check "risks or TODOs"      "(TODO|risk|limitation|follow.up|next)"
check "next steps"          "(next|follow|continue|remaining|after)"

if [ "$SCORE" -lt 4 ]; then
  echo "[handoff-completeness-check] Incomplete handoff. Missing:"
  for item in "${MISSING[@]}"; do
    echo "  - $item"
  done
  echo "Add the missing elements before marking the task complete."
  exit 0  # Warning only; set to exit 1 for blocking mode
fi

echo "[handoff-completeness-check] PASS — handoff complete."
exit 0
```

## Sources / Inspiration

Handoff completeness patterns from multi-agent workflow guides. Complements `handoff-summary` and `validation-required` in this repository.
