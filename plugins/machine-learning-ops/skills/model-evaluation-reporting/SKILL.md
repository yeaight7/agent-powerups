---
name: model-evaluation-reporting
description: Use when writing or reviewing a model evaluation report -- accuracy is being quoted alone, or stakeholders need failure modes, segment performance, and business trade-offs made explicit.
---

## Purpose

Raw accuracy metrics are not enough. Evaluation must reflect the actual business impact and failure modes of the model; this standard turns metrics into a report a stakeholder can act on.

## When to Use

- Producing an evaluation report for a trained model
- Reviewing a report that quotes a single headline metric
- A go/no-go decision depends on understanding error costs

## Inputs

- Model predictions on a held-out set
- Business context: cost of errors, key user/customer segments

## Workflow

1. **Beyond accuracy**: include the confusion matrix; report Precision, Recall, and F1; explain the cost of a False Positive vs a False Negative in the business context.
2. **Slice analysis**: report performance on key segments. A model can be 95% accurate overall but only 40% accurate on new users.
3. **Calibration**: if the model outputs probabilities, verify they are calibrated — a prediction of 0.8 should come true about 80% of the time.
4. **Format as a Markdown report** that a non-technical stakeholder can read, highlighting trade-offs and worst-case scenarios.

## Output

- A Markdown evaluation report: headline metrics, confusion matrix, per-segment table, calibration assessment, and explicit trade-offs/worst cases

## Verification

- [ ] Confusion matrix plus Precision/Recall/F1 present (not accuracy alone)
- [ ] False Positive vs False Negative costs stated in business terms
- [ ] Key segments sliced and reported
- [ ] Calibration assessed whenever probabilities are output
- [ ] Report readable by a non-technical stakeholder

## Failure Modes

- **Headline-metric reporting** — one aggregate number hides segment failures; always include slices.
- **Cost-free framing** — treating FP and FN as equivalent when their business impact differs by orders of magnitude.
- **Uncalibrated probabilities read as confidence** — stakeholders will read 0.8 as "80% sure"; verify calibration before they do.
