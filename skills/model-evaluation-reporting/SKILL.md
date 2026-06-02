---
name: model-evaluation-reporting
description: "Standardize the reporting of model metrics to ensure statistical rigor and business relevance."
---

# Model Evaluation Reporting

Raw accuracy metrics are not enough. Evaluation must reflect the actual business impact and failure modes of the model.

## Reporting Standards

1. **Beyond Accuracy**: Demand the Confusion Matrix. Demand Precision, Recall, and F1. Explain the cost of a False Positive vs. a False Negative in the business context.
2. **Slice Analysis**: Report performance on key segments. A model might be 95% accurate overall, but only 40% accurate on new users.
3. **Calibration**: If the model outputs probabilities, verify if they are calibrated. A prediction of 0.8 should mean it happens 80% of the time.
4. **Action**: Format the output as a Markdown report that a non-technical stakeholder can read, highlighting trade-offs and worst-case scenarios.