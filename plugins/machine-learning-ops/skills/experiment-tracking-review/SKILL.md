---
name: experiment-tracking-review
description: Use when reviewing ML training code to confirm a run could be reconstructed later -- hyperparameters, metrics, data references, and artifacts logged, not just printed to stdout.
---

## Purpose

An ML experiment is useless if you cannot reconstruct exactly how it was run and what data it used. This review checks that everything needed for reconstruction is logged.

## When to Use

- Reviewing a training script before serious experiment cycles begin
- Results exist but nobody can say which configuration produced them
- Metrics are printed to stdout only

## Inputs

- The training script(s) and any tracking/config setup (MLflow, wandb, config files)

## Workflow

1. **Hyperparameter logging**: the script logs *every* hyperparameter (learning rate, batch size, architecture details). Hardcoded magic numbers must be extracted to a config and logged.
2. **Metric logging**: training and validation metrics are logged at each epoch or step, not just at the end.
3. **Artifact saving**: final model weights, preprocessing scalers/encoders, and the exact configuration file are saved together in a versioned directory or tracking system.
4. **Data reference**: the run records which data it used (path, version, or hash).
5. **Enforce structured logging** (JSON, MLflow, wandb) — stdout-only metric reporting is a blocking finding.

## Output

- A finding list of what is not logged or saved, with the specific fix for each gap

## Verification

- [ ] Every hyperparameter logged (no unlogged magic numbers remain)
- [ ] Per-epoch/step train and validation metrics logged
- [ ] Weights + preprocessors + config saved together, versioned
- [ ] Data reference (path/version/hash) recorded with the run
- [ ] No stdout-only metric reporting remains

## Failure Modes

- **End-only metrics** — a final score without curves hides divergence and the onset of overfitting.
- **Orphaned artifacts** — weights saved without the matching scaler/encoder and config cannot be served correctly later.
- **Config drift** — the logged config differs from what the script actually used; log the resolved config at runtime.
