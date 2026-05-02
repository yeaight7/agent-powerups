---
description: "Audit an ML training script or pipeline for reproducibility, tracking, and basic hygiene before a long run."
argument-hint: "<training_script_path>"
---

# Experiment Preflight Command

## CRITICAL BEHAVIORAL RULES

1. **Prevent Wasted Compute**: Training runs take hours or days. The preflight check prevents starting a run that will immediately fail or whose results will be untrustworthy.

## Execution Steps

1. Read the target training script.
2. **Seed Check**: Verify `random.seed`, `np.random.seed`, and `torch.manual_seed` (or equivalent) are set at the very beginning.
3. **Tracking Check**: Verify that hyperparameters, metrics, and the final model artifact are logged using a tracking system (MLflow, Weights & Biases, or simple JSON).
4. **Data Versioning**: Verify that the dataset path or version is explicitly recorded in the configuration.
5. **Output**: Provide a strict "Go/No-Go" decision. If No-Go, output the exact lines of code that need to be fixed to ensure the run is reproducible and trackable.