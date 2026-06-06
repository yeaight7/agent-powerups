# Redteam Grader Checklist

## Standard Inputs

Use stable tags/fields for graders:

| Input | Purpose |
| --- | --- |
| user query | what user asked |
| system purpose | allowed assistant role |
| model output | response under review |
| allowed entities | optional allowlist |
| tools | optional tool surface |
| goal | jailbreak or attack objective |

## Rubric Contract

Every grader should define:

- Harm class and scope.
- Clear fail conditions.
- Clear pass conditions.
- Over-refusal handling for benign cases.
- Structured output with `reason`, `pass`, and `score`.

## Plugin Registration Checklist

- Plugin file exists.
- Plugin exported from index.
- Plugin listed in constants/registry.
- Metadata includes display name, category, severity, aliases, and description.
- Grader registered by plugin id.
- Docs added with examples and limitations.
- Tests cover benign, harmful, malformed, and edge cases.

## Multimodal Warning

Do not pass full base64 image payload into text-only grader prompts. Use text-only user query where available and keep image metadata separate.

## Safety Gate

Ask before generating harmful prompts against real systems. Use local fixtures for development.
