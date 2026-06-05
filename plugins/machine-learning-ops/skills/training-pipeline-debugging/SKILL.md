---
name: training-pipeline-debugging
description: Use when an ML training run fails or misbehaves -- NaN losses, out-of-memory errors, shape mismatches, or a model that cannot fit even a single batch.
---

## Purpose

ML training bugs are often silent mathematical errors rather than explicit code crashes. This protocol localizes the standard failure classes quickly.

## When to Use

- Loss becomes NaN or diverges
- Training crashes with out-of-memory errors
- Shape/dimension errors at matrix multiplications or loss computation
- The pipeline runs but the model never learns

## Inputs

- The failing training script and its error output or loss curve

## Workflow

1. **Run the overfit test first**: fit a single batch of ~10 examples. If the model cannot achieve near-zero loss on a single batch, the pipeline is fundamentally broken — do not debug full runs until the single-batch test passes.
2. **NaN losses** — check:
   - Learning rate too high?
   - Missing data (NaNs in input)?
   - Log/Exp/Divide-by-zero in custom loss functions?
   - Exploding gradients (clip gradients)?
3. **OOM (out of memory)**:
   - Reduce batch size.
   - Check for memory leaks in the training loop (e.g., accumulating history across epochs without `.detach()`).
4. **Shape mismatches**:
   - Add temporary print statements or assertions on `tensor.shape` before matrix multiplications and loss calculations.

## Output

- The identified failure class and its specific fix, or a single-batch reproduction showing exactly where the pipeline breaks

## Verification

- [ ] Single-batch overfit test run before any full-run debugging
- [ ] For NaN: learning rate, input NaNs, unsafe math, and gradient explosion all checked
- [ ] For OOM: batch size and training-loop accumulation both checked
- [ ] For shapes: assertions placed before matmul/loss sites
- [ ] Fix validated by re-running the previously failing case

## Failure Modes

- **Debugging full runs first** — hours per iteration; the single-batch test gives answers in minutes.
- **Treating NaN as random** — NaN losses have a small set of causes; check all four systematically instead of restarting with a lower LR.
- **Batch-size-only OOM fixes** — shrinking the batch hides a loop leak that will OOM again later; check accumulation too.
- **Leftover instrumentation** — remove temporary shape prints/assertions once the fix is validated.
