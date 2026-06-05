---
name: reproducible-training-runs
description: Use when reviewing or modifying ML training scripts that must produce identical results across runs or machines -- runs with the "same" config differ, or a past result must be reconstructed exactly.
---

## Purpose

Enforce seed setting, deterministic operations, and environment tracking so a training run can be reproduced exactly.

## When to Use

- Reviewing or modifying a training script that must be deterministic
- Two runs with the "same" configuration produced different results
- A past result needs to be reconstructed exactly

## Inputs

- A target Python training script

## Workflow

1. **Global seed initialization**: ensure a single function sets seeds for all relevant libraries (`random`, `numpy`, `torch`, `tensorflow`).
2. **Deterministic algorithms**: for PyTorch or TensorFlow, check that deterministic algorithms are enabled (e.g., `torch.use_deterministic_algorithms(True)`).
3. **Data loading**: verify data loaders use deterministic shuffling and that worker processes are seeded correctly to avoid identical augmentations.
4. **Environment & config tracking**: ensure the script logs the exact configuration, dependency versions, and data hashes.
5. **Review first**: point out missing reproducibility guards before rewriting the script. Provide the exact seed-initialization snippet — do not hide side effects.

## Output

- A list of missing reproducibility guards with the exact code snippets to add, plus any performance trade-off warnings

## Verification

- [ ] All library seeds set from one place
- [ ] Deterministic-algorithm flags enabled (or the gap explicitly accepted)
- [ ] Loader shuffling and worker seeding deterministic
- [ ] Configuration, dependency versions, and data hashes logged
- [ ] User warned if determinism flags significantly slow training

## Failure Modes

- **Partial seeding** — seeding `random` but not the framework or loader workers still yields nondeterminism.
- **Silent slowdown** — enabling deterministic algorithms can cost real training speed; surface the trade-off instead of hiding it.
- **Rewriting before reviewing** — changing the script without first listing the gaps loses the audit trail.
