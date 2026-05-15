---
name: deploy-pipeline-runbook
description: Coordinate multi-system deployment steps as a review-first runbook with explicit approval before any external write or promotion action.
---

# Deploy Pipeline Runbook

This is a trust-sensitive runbook for multi-system deployments. Every write or promotion action requires explicit human approval.

## When to Use
- A release spans multiple systems or vendors (billing, database, app, notifications).
- Order of operations matters and rollback must be planned before execution starts.
- A failed step in one system could corrupt state in a downstream system.

## Core Rules
- Inspect current state before each external step.
- Dry-run whenever the target system supports it.
- Show side effects before asking for approval — never surprise.
- Require explicit approval before every write, promotion, or announcement.
- Define the rollback path before the first irreversible step.

## Runbook Structure

### 1. Preparation
- List every system touched.
- State the exact intended change per system (e.g., "bump subscription plan from X to Y in billing API").
- Confirm credentials, access paths, and required permissions.
- Identify which steps are reversible and which are not.

### 2. Sequence the rollout
1. Config or billing prerequisites.
2. Schema migrations or data backfills.
3. Application deploy or feature promotion.
4. Smoke checks and health validation.
5. Stakeholder notifications.

### 3. Approval checkpoint (required before every write)

Use this exact format:

```
NEXT ACTION: [exact command or API call]
SYSTEM: [target system / environment]
SIDE EFFECTS: [what changes, what is created, what is sent]
IRREVERSIBLE: yes/no — [why]
ROLLBACK: [exact steps to undo this if it fails]

Approve? (yes to proceed)
```

### 4. Execute one step at a time
- Run the approved action.
- Verify the outcome before moving to the next step.
- Stop immediately on any unexpected state or error.

### 5. Closeout
```
COMPLETED: [timestamp]
CHANGES MADE: [summary of what changed per system]
FOLLOW-UP CHECKS: [monitoring, alerts, or manual verifications needed]
ROLLBACK STATUS: available / partially available / consumed
```

## Rollback Plan Template

Define this before step 1 of execution:

```
IF [step N] fails:
  1. [immediate containment action]
  2. [system-specific undo command or API call]
  3. [verification that rollback succeeded]
  4. [notification to stakeholders]
```

## Safety Constraints
- Do not proceed past an approval checkpoint without an explicit affirmative response from the user.
- Do not infer approval from silence, partial answers, or "looks good" statements — require a clear "yes".
- Do not skip the dry-run step for systems that support it.
- Do not perform rollback steps that were not defined in the pre-execution rollback plan.
- Do not make assumptions about current system state — inspect it before each step.

## Validation / Done Criteria
- Rollback plan was defined and documented before the first irreversible step.
- Every approval checkpoint was acknowledged with an explicit user affirmative.
- Closeout block was produced: timestamp, per-system changes, follow-up checks, rollback status.
- No step was executed without a prior outcome verification of the previous step.

## Typical Systems

- Billing platforms (plan changes, entitlements)
- Databases (migrations, backfills)
- Application deploy targets (containers, serverless, CDN)
- Messaging or incident channels (Slack, PagerDuty, email)

The specific vendor does not change the safety model.
