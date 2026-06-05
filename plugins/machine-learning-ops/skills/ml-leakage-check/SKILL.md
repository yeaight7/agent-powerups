---
name: ml-leakage-check
description: Use when reviewing ML preprocessing or feature pipelines for target leakage -- validation metrics look suspiciously good, transformers are fitted before splitting, or features may not exist at prediction time.
---

## Purpose

Target leakage is the most common and dangerous error in applied ML. It creates models that look perfect in validation but fail instantly in production. This check inspects the pipeline for the standard leakage vectors.

## When to Use

- Reviewing preprocessing or feature-engineering code before training sign-off
- Validation metrics look too good to be true
- A model performed far worse in production than in validation

## Inputs

- The preprocessing/feature pipeline code and the train/test split logic

## Workflow

1. **Global scaling/imputation**: was any statistic (mean, std, encoder vocabulary) computed on the *entire* dataset before splitting? That leaks the test distribution into training.
2. **Future features**: is any training feature unavailable at the moment of prediction in real life? (e.g., using "surgery_outcome" to predict "hospital_admission_length")
3. **ID proxies**: are database IDs or row numbers included as features? They often correlate with time or order of entry.
4. **Enforce the order**: Split FIRST, then fit transformers on Train ONLY, then transform Train/Val/Test.

## Output

- A leakage verdict per vector (global statistics, future features, ID proxies), citing the offending lines and the fix for each

## Verification

- [ ] All fit/fit_transform calls occur after the split and only on training data
- [ ] Every feature audited for availability at prediction time
- [ ] No raw IDs or row numbers among the features
- [ ] Findings cite specific code lines

## Failure Modes

- **Pipeline blindness** — leakage hidden inside helper functions or composed pipelines; trace where fitting actually happens.
- **"It's just scaling"** — dismissing global scaling as harmless; it still leaks distribution information.
- **Fixing one vector only** — re-running after one fix while the other vectors remain unchecked; audit all three every time.
