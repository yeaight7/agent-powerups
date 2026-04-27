---
name: repo-map
description: Use when the task is to understand an unfamiliar codebase, locate key entry points, or summarize architecture before editing.
---

## Purpose

Produce a structured overview of an unfamiliar codebase before making changes. Prevents wasted effort caused by misunderstanding project layout or entry points.

## When to Use

- Starting work on an unfamiliar repository or module.
- Onboarding to a new project before the first edit.
- Locating where a feature lives before implementing or modifying it.

Do not edit code during this skill. Observation only.

## Inputs

- Repository path or access to the codebase.
- Optional: specific area of interest (module, feature, data flow).

## Workflow

1. Identify project root, package manager, and language(s).
2. Find main entry points (executables, API handlers, CLI commands).
3. Read the smallest set of files needed to explain the architecture.
4. Map major modules, their responsibilities, and how data flows between them.
5. Flag risky or complex areas (high churn, missing tests, tangled dependencies).

## Output

- **Project purpose** — What it does in one or two sentences.
- **Entry points** — Where execution starts.
- **Main modules** — What each major directory or package is responsible for.
- **Data flow** — How a typical request or operation moves through the system.
- **Risky areas** — Complex, undertested, or high-coupling zones to approach carefully.

## Verification

- [ ] No code was edited during this skill
- [ ] All major modules identified
- [ ] Entry points documented
- [ ] Risky areas flagged

## Failure Modes

- **Premature editing** — Do not make changes during mapping. Finish the map first.
- **Monorepo confusion** — Map each package or app separately if the repo contains multiple independent projects.
- **Metaprogramming blind spots** — Dynamic languages may have runtime-defined routes or classes. Note these as limitations in the output.
