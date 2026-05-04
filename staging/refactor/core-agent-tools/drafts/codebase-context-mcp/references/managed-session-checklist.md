# Managed MCP Session Checklist

**DRAFT: requires review before catalog/plugin activation.**

## Before Connect
- Transport selected: stdio or HTTP.
- Workspace root explicit.
- Server command or URL reviewed.
- Env vars named, not inherited broadly.
- Timeout set.
- Cleanup path known.

## Stdio Session
Use stdio for local one-shot work when server should die after client exits.

Checklist:
- Spawn with scoped cwd.
- Track child PID.
- Race connect with timeout.
- Close client and transport.
- Kill process tree on timeout or failed close.

## HTTP Session
Use HTTP only when local server already exists or user approved starting one.

Checklist:
- URL is localhost or approved remote.
- Auth/token handling reviewed.
- Health endpoint or tool-list check succeeds.
- User decides whether server remains running.

## Freshness Check
Before trusting map/context:
- compare git status
- check map timestamp if available
- verify target paths still exist
- refresh only scoped context, not whole repo by default

## Failure Handling
| Symptom | Action |
| --- | --- |
| connect timeout | close transport, kill process tree |
| stale map | refresh scoped paths |
| unknown tool | list tools, update assumptions |
| global config imported | stop; require explicit config |
