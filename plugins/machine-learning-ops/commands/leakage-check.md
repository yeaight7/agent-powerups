---
description: "Audit data preprocessing and splitting logic for target leakage."
argument-hint: "<preprocessing_script_path>"
---

# Leakage Check Command

## CRITICAL BEHAVIORAL RULES

1. **Hunt the Future**: Target leakage occurs when information from the future (the target variable) sneaks into the training features.

## Execution Steps

1. Read the preprocessing and splitting code.
2. **Split First**: Verify that the dataset is split into train/val/test *before* any global transformations are applied.
3. **Imputation Leakage**: Verify that scalers, encoders, and imputers are `fit` ONLY on the training set, and `transform` is applied to train/val/test. If `fit_transform` is used on the entire dataset, flag it as a critical leakage error.
4. **Feature Leakage**: Look for features that are direct proxies for the target (e.g., a "cancellation_date" feature when predicting churn).
5. **Output**: Generate a Leakage Audit Report highlighting unsafe transformations and risky features.