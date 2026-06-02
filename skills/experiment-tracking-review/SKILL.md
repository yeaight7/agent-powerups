---
name: experiment-tracking-review
description: "Verify that all hyperparameters, metrics, and data references are properly logged."
---

# Experiment Tracking Review

An ML experiment is useless if you cannot reconstruct exactly how it was run and what data it used.

## Review Protocol

1. **Hyperparameter Logging**: Ensure the script logs *every* hyperparameter (learning rate, batch size, architecture details). Hardcoded magic numbers in the script must be extracted to a config and logged.
2. **Metric Logging**: Verify that training and validation metrics are logged at each epoch or step, not just at the end.
3. **Artifact Saving**: Ensure the final model weights, preprocessing scalers/encoders, and the exact configuration file are saved together in a versioned directory or tracking system.
4. **Action**: Do not allow training scripts to print metrics to stdout only. Enforce structured logging (JSON, MLflow, wandb).