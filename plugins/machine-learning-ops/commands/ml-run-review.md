# ml-run-review

Review a machine learning training run or experiment configuration for soundness, reproducibility, and evaluation rigor.

## Prerequisites

Provide the agent with the training script, experiment configuration, or metric logs you want reviewed.

## Review Focus

1. **Evaluation Rigor:** Is there a proper holdout set? Is the cross-validation strategy appropriate (e.g., time-based splitting for time series)?
2. **Data Leakage Check:** Are preprocessing steps (scaling, imputing) fit only on the training set?
3. **Reproducibility:** Are random seeds fixed? Are hyperparameters explicitly logged?
4. **Metrics:** Do the chosen metrics align with the stated goal? Are baselines established?

## Output

The agent will provide a brief markdown summary of identified risks and propose specific, targeted code fixes. The agent will not make changes without your explicit approval.