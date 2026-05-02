---
name: incident-readout
description: "Use after fixing a bug to generate a blameless post-mortem summary for human review."
---

# Incident Readout

When a complex debugging session ends, you must produce an incident readout. This prevents knowledge loss and helps humans review the fix quickly.

## Format

Output an `incident-readout.md` (or print to terminal) using this structure:

### 1. The Symptom
What was reported? (1-2 sentences)

### 2. The Root Cause
What was the actual underlying technical reason for the failure? Be highly specific about the exact line of code, assumption, or state that failed.

### 3. The Fix
What did we change to fix it? Provide a high-level summary of the structural change, not just a diff.

### 4. Prevention
How do we ensure this never happens again? (e.g., "Added test case X", "Refactored module Y to be strongly typed").