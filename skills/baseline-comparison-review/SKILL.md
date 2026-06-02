---
name: baseline-comparison-review
description: "Ensure that new complex models actually outperform simple, naive baselines."
---

# Baseline Comparison Review

Machine learning models add massive technical debt. You must constantly justify their existence by comparing them to a "dumb" baseline.

## Review Protocol

1. **Define the Naive Baseline**:
   - For classification: Predict the majority class.
   - For regression: Predict the mean or median of the training target.
   - For time series: Predict the last known value (naive persistence).
2. **Define the Heuristic Baseline**: What simple `if/else` rule would a domain expert write?
3. **Evaluate the Delta**: If the complex Deep Learning model only beats the heuristic baseline by 1%, recommend keeping the heuristic. The complexity is not worth the maintenance cost.
4. **Action**: Always demand a baseline evaluation script before approving a new model architecture.