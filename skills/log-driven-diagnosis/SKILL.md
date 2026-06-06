---
name: log-driven-diagnosis
description: Use when debugging complex runtime failures, distributed systems, or issues where a local debugger cannot be attached.
---

## Purpose

When you cannot step through code, logs are your only visibility. Be methodical about extracting signal from noise — never dump whole log files into context.

## When to Use

- Runtime failures where a debugger cannot be attached
- Distributed systems where the failure spans services
- Issues reproducible only from log evidence

## Inputs

- Log files or a log explorer covering the incident window
- The incident timestamp and, if available, a request/trace ID

## Workflow

1. **Time-bound the search.** Never dump the whole log file — always `grep` for timestamps around the reported incident, or use `tail`:

   ```bash
   tail -n 200 app.log                          # most recent context
   grep -n "2026-06-06T14:0" app.log            # window around the incident
   awk '/14:02:00/,/14:05:00/' app.log          # bounded slice between timestamps
   ```

2. **Identify the request ID.** If the system uses distributed tracing or request IDs, find the ID associated with the error, then search the log corpus for *only* that ID to trace the complete lifecycle of the failed request:

   ```bash
   grep -n "ERROR" app.log | head -5            # find the failing entry and its ID
   grep -n "<request-id>" app.log               # full lifecycle of that request
   # structured (JSON) logs:
   jq -c 'select(.request_id == "<request-id>")' app.log.json
   ```

3. **Look for preceding warnings.** The `ERROR` log is usually just the final crash. The actual root cause is often a `WARNING` or unexpected `INFO` log that occurred milliseconds earlier (e.g., a connection retry failing, or an empty array being returned):

   ```bash
   grep -n -B 20 "<error-text>" app.log | grep -inE "warn|retry|timeout|empty"
   ```

4. **Add missing logs.** If the logs do not provide enough visibility, your first action must be to *add temporary logging* to the application, reproduce the bug, and gather the new signals. Do not guess blindly if the logs are insufficient.

## Output

- The traced lifecycle of the failing request
- The suspected root-cause log line(s), including any preceding warnings
- Any temporary logging added (flagged for later removal)

## Verification

- [ ] Every search was time-bounded or ID-bounded — no full-file dumps in context
- [ ] Full request lifecycle traced when an ID exists
- [ ] Lines preceding the error inspected, not just the error line itself
- [ ] Temporary logging added (and flagged for removal) where visibility was missing

## Failure Modes

- **Error-line tunnel vision** — reading only the final ERROR while the cause sits in an earlier WARNING.
- **Context flooding** — dumping megabytes of log into the conversation instead of bounded slices.
- **Blind guessing** — iterating on fixes when the honest move is adding logging and reproducing once more.
