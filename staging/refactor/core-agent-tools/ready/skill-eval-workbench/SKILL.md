---
name: skill-eval-workbench
description: Use when designing, running, debugging, or hardening deterministic eval suites for agent skills, prompts, tool workflows, or MCP-backed cases.
---

# Skill Eval Workbench

## When To Use
- A skill or prompt needs repeatable quality checks across models.
- A workflow needs file-based graders, command traces, or local artifact checks.
- A tool/MCP skill needs a hidden service fixture or sandboxed test workspace.
- A previous agent attempt failed and you need trace-driven diagnosis before editing instructions.

## Requirements / Checks
- Confirm an eval runner exists locally before running anything. Do not install deps without approval.
- Prefer local deterministic graders over model-graded assertions.
- If Docker, remote models, API keys, or live services are involved, ask before execution.
- Use scoped test credentials only; treat traces, result files, preserved workspaces, and stdout as sensitive.

## Workflow
1. Define behavior under test as observable output: files, command args, JSON, logs, or safety refusal.
2. Create a minimal suite with one positive case, one important edge case, and one no-tool-needed control.
3. Put skill/reference material into an explicit `references/` area and case fixtures into scoped support dirs.
4. For MCP-backed cases, prefer hidden service fixtures when server internals should not be visible to the agent.
5. Run the smallest local suite first, then inspect failing `result`, `summary`, trace, and workspace evidence.
6. Classify each failure before editing: unclear skill, missing refs, brittle grader, unrealistic fixture, task ambiguity, product bug.
7. Edit only the cause you classified, then re-run the same case.

## Safety Constraints
- Do not forward broad env vars into eval sandboxes; pass only named test vars.
- Do not print secrets in prompts, graders, traces, or artifacts.
- Do not mock a CLI/API unless the mock faithfully matches validation, output, and failure modes.
- Do not treat a green mock eval as proof that live integration works.
- Do not auto-enable host/user MCP configs inside eval containers.

## Validation / Done Criteria
- Suite has deterministic pass/fail evidence.
- Failure triage points to a concrete cause before edits.
- Re-run proves the targeted change fixed the failing case.
- Output includes command used, model(s), trial count, failures, and artifact paths.

## References
- `references/workbench-suite-model.md`
