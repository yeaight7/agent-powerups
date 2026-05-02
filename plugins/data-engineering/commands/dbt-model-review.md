---
description: "Build a new analytics feature or dbt model guided by business requirements and data exploration"
argument-hint: "<feature or model description>"
---

# Analytics Feature Development

## CRITICAL BEHAVIORAL RULES

1. **Execute steps in order.** Do NOT skip ahead or merge steps.
2. **Write output files.** Each step produces its output in `.analytics-feature/` before the next step begins. Read from prior files — do NOT rely on context window memory.
3. **Stop at checkpoints.** When reaching a `PHASE CHECKPOINT`, stop and wait for explicit user approval.
4. **Halt on failure.** If any step fails, stop immediately and ask how to proceed.
5. **Never enter plan mode autonomously.** This command IS the plan — execute it.

## Pre-flight Checks

### 1. Check for existing session

Check if `.analytics-feature/state.json` exists:
- If `status` is `"in_progress"`: Display current step and ask to resume or start fresh.
- If `status` is `"complete"`: Ask whether to archive and start fresh.

### 2. Initialize state

Create `.analytics-feature/` and `state.json`:

```json
{
  "feature": "$ARGUMENTS",
  "status": "in_progress",
  "current_step": 1,
  "completed_steps": []
}
```

---

## Phase 1: Business Analysis & Data Discovery (Steps 1–2)

### Step 1: Business Requirements Analysis

Use the Task tool to analyze the business requirements for: $FEATURE.
Identify the domain, business question, key metrics, dimensions, grain, required source systems, and potential data quality concerns.
Save to `.analytics-feature/01-business-requirements.md`. Update `state.json`.

### Step 2: Data Source Exploration

Explore the data sources using the MCP dbt tools or by analyzing the project structure.
Identify which source tables or existing dbt models contain the required data.
Save to `.analytics-feature/02-data-exploration.md`. Update `state.json`.

---

## PHASE CHECKPOINT 1 — User Approval Required

Present findings from Phase 1 and ask the user for approval to proceed to model design. Do NOT proceed until approved.

---

## Phase 2: Dimensional Model Design (Steps 3–4)

### Step 3: Model Architecture Design

Design the dimensional model architecture. Define whether it's a fact, dimension, or mart. Define the grain, column types, dependencies, CTE structure, and DAG plan.
Save to `.analytics-feature/03-model-design.md`. Update `state.json`.

### Step 4: Test Design

Design data quality tests. List all generic tests (unique, not_null, relationships, etc.) and singular tests for business rules.
Save to `.analytics-feature/04-test-design.md`. Update `state.json`.

---

## PHASE CHECKPOINT 2 — User Approval Required

Present the design and test plan from Phase 2 and ask the user for approval to proceed to implementation.

---

## Phase 3: Implementation (Steps 5–7)

### Step 5: SQL Model Implementation

Implement the dbt SQL model according to the design. Follow project conventions (e.g., CTE usage, naming patterns).
Save a summary to `.analytics-feature/05-implementation.md` (include file paths created/modified). Update `state.json`.

### Step 6: YAML Documentation

Write the YAML documentation and test definitions for the new model.
Save a summary to `.analytics-feature/06-documentation.md`. Update `state.json`.

### Step 7: Run and Validate

Execute dbt commands (`dbt compile`, `dbt run`, `dbt test`) to validate the implementation. Save results to `.analytics-feature/07-validation.md`. Update `state.json`.

---

## PHASE CHECKPOINT 3 — User Approval Required

Present the validation results and ask for final approval.

---

## Completion

Mark status as `complete` in `state.json` and present the final summary of the completed analytics feature.
