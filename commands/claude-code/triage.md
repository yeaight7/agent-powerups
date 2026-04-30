# triage

Use to process a backlog of issues or PRs into a prioritized action list.

Steps:

1. Fetch open items: `gh issue list --state open` or `gh pr list --state open`.
2. Read each title and body. Group by theme (bug, feature, chore, debt).
3. Score each item on two axes: user impact (high/med/low) and effort (small/medium/large).
4. Identify blockers: anything that prevents other work or blocks a release.
5. Output a ranked list: blockers first, then high-impact/low-effort, then the rest.
6. Flag anything that needs more information before it can be acted on.

Do not close, label, or comment on issues unless explicitly asked.
