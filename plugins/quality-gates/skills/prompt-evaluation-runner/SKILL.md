---
name: prompt-evaluation-runner
description: Use when evaluating prompts, LLM outputs, red-team suites, or model behavior with local eval configs and safe provider/cost controls.
---

# Prompt Evaluation Runner

## When to use
Use this skill when you need to evaluate an LLM app, test a prompt, or run red-teaming/vulnerability scans against a target model or application.

## Requirements / Checks
1. Check if an evaluation tool is defined in project deps, scripts, lockfiles, or local toolchain.
2. Do not run external commands like `npx Prompt evaluation@latest` directly.
3. If missing, ask before adding a local dev dependency or using an ephemeral runner.
4. Confirm expected cost, provider, API keys, and network target before execution.

## Workflow
1. **Define risk**: State target behavior, failure mode, provider(s), and budget limits.
2. **Choose assertions**: Prefer deterministic checks first: exact/contains/regex/JSON/schema/javascript/python/cost/latency.
3. **Use model graders sparingly**: Pin grader provider/model and explain cost/non-determinism.
4. **Configure minimally**: Keep config to description, env refs, prompts, providers, default assertions, and tests.
5. **Handle env safely**: Use templated env references such as `{{env.NAME}}`; never hardcode keys.
6. **Execute locally**: Run smallest suite first. Ask before long, paid, red-team, or production-targeted runs.
7. **Analyze failures**: Separate prompt failures, provider variance, flaky graders, bad fixtures, and config mistakes.

## Safety Constraints
- Do NOT log, echo, or store secrets (API keys) in configuration files or chat output.
- Do NOT run evaluations against production endpoints without user consent.
- Avoid executing arbitrary remote code or unvetted plugins during evaluation.

## Validation / Done Criteria
- Evaluation config is valid, minimal, and uses safe env refs.
- Deterministic assertions exist where possible.
- Run scope, provider, and cost are reported.
- Results are summarized without leaking sensitive data.

## References
- `references/eval-config-patterns.md`
