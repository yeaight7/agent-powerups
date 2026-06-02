---
name: ml-leakage-check
description: "Identify and prevent target leakage in ML preprocessing pipelines."
---

# ML Leakage Check

Target leakage is the most common and dangerous error in applied ML. It creates models that look perfect in validation but fail instantly in production.

## Leakage Vectors to Check

1. **Global Scaling/Imputation**: Did the author calculate the mean of the *entire* dataset to impute missing values before splitting? This leaks the test set distribution into the training set.
2. **Future Features**: Is there a feature available in the training data that would absolutely not be available at the moment of prediction in real life? (e.g., using "surgery_outcome" to predict "hospital_admission_length").
3. **ID Proxies**: Are database IDs or row numbers accidentally included as features? They often correlate with time or order of entry.
4. **Action**: Enforce the rule: Split FIRST, then fit transformers on Train ONLY, then transform Train/Val/Test.