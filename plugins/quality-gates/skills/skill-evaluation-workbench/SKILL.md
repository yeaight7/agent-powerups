---
name: skill-evaluation-workbench
description: Use when designing, running, debugging, or hardening deterministic eval suites for agent skills, prompts, tool workflows, or MCP-backed cases.
---

# Skill Evaluation Workbench

## When To Use

- A skill or prompt needs repeatable quality checks across models or configurations.
- A workflow needs file-based graders, command traces, or local artifact checks.
- A tool or MCP skill needs a hidden service fixture or sandboxed test workspace.
- A previous agent attempt failed and you need trace-driven diagnosis before editing instructions.

## Requirements / Checks

- Confirm an eval runner exists locally before running anything. Do not install deps without approval.
- Prefer local deterministic graders over model-graded assertions.
- If Docker, remote models, API keys, or live services are involved, ask before execution.
- Treat traces, result files, preserved workspaces, and stdout as potentially sensitive.

## Minimal Suite Structure

Every suite should have at least three cases:

| Case | Purpose |
|---|---|
| Positive (golden path) | Skill handles the normal use case correctly |
| Edge case | Skill handles an important boundary condition |
| Control (no-tool-needed) | Skill does not over-trigger on a clearly unrelated input |

Place fixtures in `cases/`, skill/reference material in `references/`, and grader scripts in `graders/`.

## Grader Types

| Type | When to use | Deterministic? |
|---|---|---|
| File existence | Skill was supposed to create a file | Yes |
| File content match | Output matches expected text or schema | Yes |
| Command exit code | Script/tool succeeded | Yes |
| JSON schema | Output is valid structured data | Yes |
| Regex match | Output contains expected pattern | Yes |
| Custom script | Complex logic not covered above | Yes (if written correctly) |
| Model grader | Subjective quality judgment | No — use sparingly, pin model |

## Workflow

1. **Define observable behavior** — state what the skill must produce: files, command args, JSON output, logs, or a safety refusal. If it's not observable, it can't be graded.

2. **Create the minimal suite** — one positive, one edge, one control case. Add more only after the minimal suite passes.

3. **Structure fixtures** — put case inputs in `cases/<case-name>/`, expected outputs in `cases/<case-name>/expected/`. For MCP-backed cases, use hidden service fixtures so server internals are not visible to the agent.

4. **Run smallest local suite first** — inspect the `result`, `summary`, trace, and workspace evidence from the first failure before editing anything.

5. **Classify the failure before editing**:

   | Failure type | Fix target |
   |---|---|
   | Skill instructions are unclear | Edit `SKILL.md` |
   | Missing reference material | Add to `references/` |
   | Grader logic is brittle | Fix the grader script |
   | Fixture is unrealistic | Replace the test input |
   | Task is ambiguous | Clarify the task definition |
   | Actual product bug | File as a bug, not a skill fix |

6. **Edit only the classified cause**, then re-run the same case.

## Safety Constraints

- Do not forward broad env vars into eval sandboxes — pass only named test variables.
- Do not print secrets in prompts, graders, traces, or artifacts.
- Do not mock a CLI or API unless the mock faithfully matches validation, output, and failure modes.
- Do not treat a green mock eval as proof that live integration works.
- Do not auto-enable host or user MCP configs inside eval containers.

## Validation / Done Criteria

- Suite has deterministic pass/fail evidence for all cases.
- Failure triage points to a concrete cause before any edits are made.
- Re-run proves the targeted change fixed the failing case without breaking passing cases.
- Output includes: command used, model(s), trial count, failures, and artifact paths.

## References

- `references/workbench-suite-model.md`
