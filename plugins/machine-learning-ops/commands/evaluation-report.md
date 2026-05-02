---
description: "Generate a comprehensive evaluation report for a trained model, highlighting performance, baselines, and subgroup metrics."
argument-hint: "<model_metrics_json_or_evaluation_log>"
---

# Evaluation Report Command

## CRITICAL BEHAVIORAL RULES

1. **Compare to Baseline**: Performance in a vacuum is useless. The report MUST contrast the model's metrics against a naive baseline (e.g., predicting the mean or majority class) or the previous model version.
2. **Highlight the Trade-offs**: Emphasize what the model got worse at (e.g., "Recall improved by 5%, but Precision dropped by 2%").

## Execution Steps

1. Parse the `$ARGUMENTS` to extract the metrics.
2. Format a clear Markdown report.
3. Include sections for:
   - **Topline Metrics**: The primary KPIs (Accuracy, F1, RMSE, etc.).
   - **Baseline Comparison**: How much better is this than a dumb rule?
   - **Subgroup/Slice Analysis**: Did performance degrade for specific subsets?
   - **Confusion Matrix/Error Analysis**: Where is the model making its most costly mistakes?
4. Output the Markdown report and optionally save it to `reports/YYYY-MM-DD-evaluation.md`.