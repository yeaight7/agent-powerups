---
name: dataset-split-review
description: "Audit the methodology used to split data into train, validation, and test sets."
---

# Dataset Split Review

A random split is often the wrong split. Incorrect splitting causes massive overestimation of model performance.

## Review Protocol

1. **Time-Series Data**: If the data has a time component, `train_test_split` is strictly forbidden. You must use a chronological split to prevent the model from learning the future.
2. **Group Leakage**: If the dataset has multiple rows for a single user/patient/session, a standard split will put rows from the same user in both train and test. You must use GroupKFold or group-based splitting.
3. **Stratification**: For imbalanced datasets, verify that stratification is used to maintain the target distribution across all splits.
4. **Action**: Review the splitting code and explicitly verify Time, Group, and Stratification safety.