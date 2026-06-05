---
name: baseline-comparison-review
description: Use when a new or more complex ML model is proposed and its value over simple baselines is not yet demonstrated -- before approving a new architecture or replacing an existing heuristic.
---

## Purpose

Machine learning models add technical debt. A complex model earns its place only by clearly outperforming a "dumb" baseline; this review makes that comparison explicit before a new model is approved.

## When to Use

- A new model architecture is proposed for approval
- A complex model would replace an existing heuristic or rule
- Reported gains have not been compared against any baseline

## Inputs

- The candidate model's evaluation results (metric + data split)
- The evaluation code, or enough dataset/task detail to define fair baselines

## Workflow

1. **Define the naive baseline**:
   - Classification: predict the majority class.
   - Regression: predict the mean or median of the training target.
   - Time series: predict the last known value (naive persistence).
2. **Define the heuristic baseline**: what simple if/else rule would a domain expert write?
3. **Evaluate both baselines on the same split and metric as the candidate model.**
4. **Evaluate the delta**: if the complex model only beats the heuristic baseline marginally (e.g., ~1%), recommend keeping the heuristic — the complexity is not worth the maintenance cost.
5. **Demand a baseline evaluation script** before approving the new architecture, so the comparison is rerunnable.

## Output

- A baseline-vs-model comparison on identical data and metric, with an explicit keep/replace recommendation that weighs maintenance cost

## Verification

- [ ] Naive baseline defined and evaluated
- [ ] Heuristic baseline defined and evaluated (or explicitly ruled out with a reason)
- [ ] Candidate compared on the same split and metric as the baselines
- [ ] Delta judged against maintenance cost, not just statistical improvement
- [ ] A rerunnable baseline evaluation script exists

## Failure Modes

- **No heuristic baseline** — comparing only against the naive baseline makes weak models look strong. Ask what rule a domain expert would write.
- **Unequal comparison** — baseline evaluated on a different split or metric than the model. Re-run both on identical data.
- **Complexity bias** — approving a model for a marginal gain without stating the maintenance cost in the recommendation.
