---
name: readme-hardening
description: Use when a README cannot be followed verbatim -- setup or test commands fail or are vague, environment requirements are unstated, or a new engineer or agent cannot bootstrap the project quickly.
---

## Purpose

A good README is an executable contract, not a marketing page. It must allow an agent or a new engineer to clone the repository and run tests within 3 minutes.

## When to Use

- Onboarding feedback says setup instructions fail or are ambiguous
- The project's scripts, dependencies, or env requirements changed
- Before publishing the repo or handing it to another team or agent

## Inputs

- The current README and the repo it claims to describe
- The actual scripts and tooling (package manifest, Makefile, CI config)

## Workflow

1. **Verify commands.** Extract every shell command from the README (npm install, docker-compose up, cargo test) and check each against repo evidence — then run them in a clean environment where possible. If they fail, fix the README:

   ```bash
   rg -n "^( {4}|\t)\S|^\$ " README.md            # command lines in the README
   rg -n "\"scripts\"" -A 20 package.json         # do documented npm scripts exist?
   ```

2. **Remove ambiguity.** Replace "Install dependencies" with the exact command (npm ci). Replace "Run the app" with the exact script (npm run start:dev).

3. **Environment checklist.** Clearly list required environment variables in an env-example block — do not just say "set up your environment." Cross-check against what the code actually reads:

   ```bash
   rg -no "process\.env\.[A-Z0-9_]+" src/ | sort -u
   ```

4. **Architecture pointers.** Provide exact file paths for entry points (e.g., "Main API routing is in src/routes.ts") to save agents from searching the entire tree.

5. **Cover the minimum outline** — confirm each section exists and is accurate:

   ```markdown
   # Project name + one-line purpose
   ## Install         # exact commands
   ## Run             # exact commands, expected output
   ## Test            # exact commands
   ## Configuration   # env vars with example values
   ## Architecture    # entry points by path
   ## Troubleshooting # the 2-3 most common failures and their fixes
   ```

## Output

- A README whose every command was verified against the repo (or actually run)
- An env-var block matching what the code actually reads
- Entry-point paths for the main flows

## Verification

- [ ] Every README command exists in scripts/tooling or ran successfully
- [ ] No vague instructions remain ("install dependencies" without the command)
- [ ] Env-var list cross-checked against the code's actual reads
- [ ] Entry-point file paths verified to exist
- [ ] Outline covered: install, run, test, configuration, architecture, troubleshooting

## Failure Modes

- **Marketing-page drift** — features and badges grow while install instructions rot.
- **Untested commands** — a command transcribed from memory instead of verified against the scripts.
- **Hidden environment** — the app reads six env vars and the README names two.
- **Path-free architecture prose** — "the API layer handles routing" helps nobody; name the file.
