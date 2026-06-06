---
name: secret-leak-preflight
description: Use when about to commit, push, or publish -- staged changes touch config or environment files, generated artifacts (relay sessions, logs, build output) are being added, or the session handled credentials even indirectly.
---

## Purpose

Catch secrets before they enter git history or a published artifact. A leaked credential in a commit is a rotation incident even after the file is deleted — history retains it. The preflight is the last cheap moment to stop that.

## When to Use

- Before committing config, environment, or infrastructure changes
- Before pushing or opening a PR that includes generated artifacts
- Before publishing a release or packaging files
- After any session that handled credentials, even indirectly

## Inputs

- The staged diff and the untracked-file list
- Knowledge of which artifact directories the session wrote (relay sessions, logs, build output)

## Workflow

1. **Scan the staged diff — not the worktree.** What gets committed is the staged content:

   ```sh
   git diff --cached | rg -n 'AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|github_pat_|sk-[A-Za-z0-9]{20,}|xox[baprs]-|-----BEGIN [A-Z ]*PRIVATE KEY-----'
   git diff --cached | rg -in '(api[_-]?key|secret|token|password|bearer)\s*[:=]'
   ```

2. **Review untracked files before adding.** New environment or credential files are the classic leak:

   ```sh
   git status --short
   ```

   Anything with env, credential, key, or pem in its name gets opened and inspected before any git add.

3. **Check generated artifact directories.** Relay turn artifacts and logs can embed tokens captured from tool output; confirm those directories are gitignored and excluded from what is being committed or published.

4. **Spot-check high-entropy strings.** Pattern lists miss rotated formats; a long random-looking constant in a diff deserves one deliberate look.

5. **On a hit: stop.** Unstage the file, remove the secret, and treat the value as compromised — recommend rotation. If it already exists in history, plan a history purge with the user; never rewrite or force-push history without explicit approval.

6. **State the verdict explicitly.** Silence is not a pass — say "no secrets found in staged changes" or list the findings.

## Output

- A pass/fail verdict for the staged changes, stated explicitly
- On fail: the file and match, the unstage action taken, and the rotation recommendation
- Confirmation that artifact directories were checked, not assumed ignored

## Verification

- [ ] The scan ran against the staged diff, not only the working tree
- [ ] Untracked files were listed and suspicious names opened
- [ ] Generated artifact locations were confirmed ignored or excluded
- [ ] Any hit led to unstage plus rotation guidance, not a quiet fix-up commit
- [ ] The verdict was stated explicitly, including the clean case

## Failure Modes

- **Worktree-only scan** — the staged diff is what ships; scanning only files on disk misses staged-but-reverted edits and vice versa.
- **Pattern-list confidence** — regexes catch known formats; entropy and context still need a deliberate look.
- **Quiet fix-up** — committing a "removed secret" follow-up leaves the value in history; rotation is still required.
- **Publishing artifacts unscanned** — relay and log files can carry tokens captured from tool output.
