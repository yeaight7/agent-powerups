---
name: log-driven-diagnosis
description: "Use when debugging complex runtime failures, distributed systems, or issues where a local debugger cannot be attached."
---

# Log-Driven Diagnosis

When you cannot step through code, logs are your only visibility. You must be methodical in how you extract signals from noise.

## Protocol

1. **Time-Bound Search**: Never dump the whole log file. Always `grep` for timestamps around the reported incident, or use tail.
2. **Identify the Request ID**: If the system uses distributed tracing or request IDs, find the ID associated with the error, then `grep` the entire log corpus for *only* that ID to trace the complete lifecycle of the failed request.
3. **Look for Preceding Warnings**: The `ERROR` log is usually just the final crash. The actual root cause is often a `WARNING` or unexpected `INFO` log that occurred milliseconds earlier (e.g., a connection retry failing, or an empty array being returned).
4. **Add Missing Logs**: If the logs do not provide enough visibility, your first action must be to *add temporary logging* to the application, reproduce the bug, and gather the new signals. Do not guess blindly if the logs are insufficient.