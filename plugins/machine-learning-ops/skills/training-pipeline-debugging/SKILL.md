---
name: training-pipeline-debugging
description: "Diagnose NaN losses, out-of-memory errors, and shape mismatches in deep learning or ML pipelines."
---

# Training Pipeline Debugging

ML training bugs are often silent mathematical errors rather than explicit code crashes.

## Debugging Protocol

1. **NaN Losses**: If loss goes to NaN, check:
   - Learning rate too high?
   - Missing data (NaNs in input)?
   - Log/Exp/Divide by zero in custom loss functions?
   - Exploding gradients (clip gradients)?
2. **OOM (Out of Memory)**:
   - Reduce batch size.
   - Check for memory leaks in the training loop (e.g., accumulating history across epochs without `.detach()`).
3. **Shape Mismatches**: 
   - Add temporary print statements or assertions asserting `tensor.shape` before matrix multiplications or loss calculations.
4. **The Overfit Test**: The ultimate test of a pipeline is fitting a single batch. If the model cannot achieve near 0 loss on a single batch of 10 examples, the pipeline is fundamentally broken. Do not debug full runs until the single-batch test passes.