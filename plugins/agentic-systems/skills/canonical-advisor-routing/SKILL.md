---
name: canonical-advisor-routing
description: Process-first advisor routing with artifact capture
---

# Canonical Advisor Routing

Route a prompt through a local provider CLI and persist the result as an artifact.

## Usage

Use the provided command wrappers:

```bash
apx ask-codex "review this patch from a security perspective"
apx ask-gemini "suggest UX improvements for this flow"
apx ask-claude "draft an implementation plan for issue #123"
```

## Routing

**Required execution path:**

Invoke the provider CLI via the canonical `apx ask-*` wrappers. Do not manually assemble raw provider CLI commands unless debugging the wrapper.

## Requirements

- The selected local CLI must be installed and authenticated.

## Artifacts

Write the response to the standard artifact location:

```text
.agent-powerups/artifacts/ask/<provider>-<slug>-<timestamp>.md
```
