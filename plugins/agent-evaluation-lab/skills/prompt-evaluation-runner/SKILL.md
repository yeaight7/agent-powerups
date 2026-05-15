---
name: prompt-evaluation-runner
description: Use when evaluating prompts, LLM outputs, red-team suites, or model behavior with local eval configs and safe provider/cost controls.
---

# Prompt Evaluation Runner

## When to use
Use when you need to evaluate an LLM app, test a prompt systematically, or run red-team/vulnerability scans against a target model or application.

## Requirements / Checks
1. Check if an evaluation tool is defined in project deps, scripts, lockfiles, or local toolchain (e.g., `promptfoo`, `evals`, `braintrust`).
2. Do not run unvetted remote runners without checking the project's toolchain first (e.g., avoid `npx promptfoo@latest` if `promptfoo` is already installed locally).
3. If no runner exists, ask before adding a dev dependency or using an ephemeral runner.
4. Confirm expected cost, provider, API keys, and network target before any execution.

## Workflow

1. **Define risk** — state target behavior, failure mode, provider(s), and budget limits before writing any config.

2. **Choose assertions** — prefer deterministic checks first:

   | Assertion type | When to use |
   |---|---|
   | `contains` / `not-contains` | Output must include/exclude specific text |
   | `regex` | Structured output pattern (e.g., JSON key present) |
   | `json-schema` | Output must conform to a schema |
   | `cost` | Must stay under a token/dollar budget |
   | `latency` | Must respond within N ms |
   | `javascript` / `python` | Custom logic when simpler types don't fit |
   | Model grader | Last resort — only for subjective quality checks |

3. **Use model graders sparingly** — pin the grader model and provider explicitly; document the cost and non-determinism risk.

4. **Minimal config structure**:
   ```yaml
   description: "Test that the summarizer stays under 200 words"
   providers:
     - id: openai:gpt-4o-mini
       config:
         temperature: 0
   prompts:
     - "Summarize: {{input}}"
   defaultTest:
     assert:
       - type: javascript
         value: output.split(' ').length < 200
   tests:
     - vars:
         input: "{{env.TEST_DOCUMENT}}"
   ```

5. **Handle env safely** — use `{{env.VAR_NAME}}` for all secrets and inputs. Never hardcode API keys or sensitive data in config files.

6. **Execute locally** — run the smallest suite first. Ask before running long, paid, red-team, or production-targeted suites.

7. **Analyze failures** — classify before fixing:
   - Prompt failure (model output is wrong)
   - Provider variance (non-deterministic model)
   - Flaky grader (model grader is inconsistent)
   - Bad fixture (test input is unrealistic)
   - Config mistake (assertion logic error)

## Safety Constraints
- Do NOT log, echo, or store API keys in configuration files or chat output.
- Do NOT run evaluations against production endpoints without user consent.
- Do not execute arbitrary remote code or unvetted plugins during evaluation.

## Validation / Done Criteria
- Eval config is valid, minimal, and uses `{{env.VAR}}` references for secrets.
- Deterministic assertions exist where possible; model grader use is documented and justified.
- Run scope, provider, and estimated cost are reported before execution.
- Results are summarized without leaking sensitive input data.

## References
- `references/eval-config-patterns.md`
