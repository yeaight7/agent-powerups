---
name: dataset-split-review
description: Use when reviewing how data is split into train/validation/test sets -- especially with time-series data, repeated entities (users, patients, sessions), or imbalanced targets.
---

## Purpose

A random split is often the wrong split. Incorrect splitting causes massive overestimation of model performance; this review verifies the split methodology matches the structure of the data.

## When to Use

- Reviewing splitting code before training or sign-off
- Data has a time component, repeated entities, or class imbalance
- Validation metrics look too good for the problem

## Inputs

- The splitting code
- The dataset's structure: time column? entity keys (user/patient/session)? target balance?

## Workflow

1. **Time-series data**: if the data has a time component, random `train_test_split` is strictly forbidden. Require a chronological split so the model cannot learn from the future.
2. **Group leakage**: if the dataset has multiple rows per user/patient/session, a standard split puts rows from the same entity in both train and test. Require GroupKFold or group-based splitting.
3. **Stratification**: for imbalanced targets, verify stratification maintains the target distribution across all splits.
4. **Verify in code, not in description**: read the actual splitting call and its parameters before issuing a verdict.

## Output

- An explicit pass/fail verdict on Time, Group, and Stratification safety, citing the splitting code

## Verification

- [ ] Time safety checked (chronological split whenever a time component exists)
- [ ] Group safety checked (no entity appears in both train and test)
- [ ] Stratification checked for imbalanced targets
- [ ] Verdict cites the actual splitting code, not the author's description of it

## Failure Modes

- **Trusting the description** — authors often believe the split is grouped or chronological when the code says otherwise. Read the code.
- **Random split on time data** — silently inflates metrics; flag as blocking, not advisory.
- **Partial grouping** — grouped train/test but a random validation split still leaks. Check every split boundary.
