---
name: regression-bisecting
description: "Use when a bug was recently introduced but you don't know which commit caused it."
---

# Regression Bisecting

When a feature used to work but is now broken, do not guess what broke it. Use binary search through git history to find the exact commit.

## Protocol

1. **Define the Test**: You must have a single command that returns exit code `0` if good, and non-zero if bad. (e.g., `npm run test:repro` or `node repro.js`).
2. **Find a Known Good State**: Ask the user or search git history for a commit where you are certain the feature worked.
3. **Find the Known Bad State**: Typically `HEAD`.
4. **Bisect**: 
   - (For human workflows, guide them to use `git bisect start <bad> <good>`).
   - For agent workflows, manually check out the midpoint commit, run the test, and narrow the window.
5. **Analyze the Offending Commit**: Once the exact commit is found, use `git show <commit>` to analyze the diff. The root cause is contained entirely within that diff.