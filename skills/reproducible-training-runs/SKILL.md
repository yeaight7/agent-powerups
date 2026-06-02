---
name: reproducible-training-runs
description: Analyzes ML training scripts to enforce seed setting, deterministic operations, and environment tracking for exact reproducibility.
---
# Reproducible Training Runs

Use this skill when reviewing or modifying ML training scripts to ensure they produce deterministic, reproducible results across runs.

## Prerequisites

- A target Python training script.

## Instructions

When applying this skill, check for and enforce the following reproducibility standards:

1. **Global Seed Initialization:** Ensure a single function sets seeds for all relevant libraries (`random`, `numpy`, `torch`, `tensorflow`).
2. **Deterministic Algorithms:** For PyTorch or TensorFlow, check if deterministic algorithms are enabled (e.g., `torch.use_deterministic_algorithms(True)`).
3. **Data Loading:** Verify that data loaders use deterministic shuffling and that worker processes are seeded correctly to avoid identical augmentations.
4. **Environment & Config Tracking:** Ensure that the script logs the exact configuration, dependency versions, and data hashes.

## Safety & Style

- **Review First:** Point out missing reproducibility guards before rewriting the script.
- **Keep it Explicit:** Provide the exact snippet for seed initialization. Do not hide side effects.
- **Performance Trade-offs:** Warn the user if enabling deterministic algorithms will significantly impact training speed.