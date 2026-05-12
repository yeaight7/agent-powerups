---
name: deploy-pipeline-runbook
description: Coordinate multi-system deployment steps as a review-first runbook with explicit approval before any external write or promotion action.
---

# Deploy Pipeline Runbook

This is an experimental, trust-sensitive runbook.

## When to Use

- A release spans multiple systems or vendors
- Order matters across billing, database, application, and notification steps
- Rollback needs to be planned before execution starts

## Core Rules

- Treat this as a runbook, not default automation
- Inspect current state before each external step
- Dry-run whenever the target system supports it
- Summarize side effects before approval
- Require explicit approval before any write, promotion, or announcement action
- Define rollback before the first irreversible step

## Runbook Structure

1. **Preparation**
   - identify systems touched
   - identify exact intended change per system
   - confirm credentials and access paths

2. **Sequence the rollout**
   - config or billing prerequisites
   - schema or migration steps
   - deploy or promotion step
   - smoke checks
   - stakeholder notifications

3. **Approval checkpoint**
   - show the exact next write action
   - show expected side effects
   - show rollback path

4. **Execute one step at a time**
   - verify after each step
   - stop on the first unexpected state transition

5. **Closeout**
   - record what changed
   - record follow-up checks
   - record rollback status

## Typical Systems

- billing platforms
- databases
- deploy targets
- messaging or incident channels

The specific vendors are optional. The safety model is not.
