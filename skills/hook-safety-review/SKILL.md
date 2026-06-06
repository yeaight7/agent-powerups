---
name: hook-safety-review
description: Use when a hook is about to be enabled or modified -- a hook recipe proposed for activation, a pre/post-tool or lifecycle hook added to agent settings, a git pre-commit hook added to a repo, or a third-party hook snippet pasted in from outside.
---

## Purpose

Review a hook definition before it is enabled so command injection, data exfiltration, and silent failure cannot ride in on automation. Hooks run automatically with the agent's privileges; a malicious or sloppy hook executes without any further review once it is on.

## When to Use

- A hook recipe (safety, quality, productivity) is a candidate for activation
- An agent settings file gains or changes a lifecycle hook entry
- A git pre-commit or pre-push hook is added or edited
- A hook snippet arrives from outside the repo

Do not use for broad agent-config audits — that is the agent-config-security-audit skill. This skill is the enablement gate for one hook at a time.

## Inputs

- The hook definition: command body, trigger event, matcher pattern
- The settings or recipe file that declares it
- What the hook can reach: environment variables, file paths, network

## Workflow

1. **Inventory the trigger surface.** Identify the event (pre-tool, post-tool, session start, commit), the matcher pattern, and how often it fires. A catch-all matcher on a high-frequency event deserves the strictest review.

2. **Scan for command injection.** Any user- or model-controlled value interpolated into a shell string is a P0 until proven bounded:

   ```sh
   rg -n '\$\{?[A-Za-z_]+\}?|\$\(|`' <hook-file>        # interpolation and substitution
   rg -n 'eval|sh -c|bash -c|Invoke-Expression' <hook-file>
   ```

3. **Scan for outbound network.** Hooks should not phone home:

   ```sh
   rg -n 'curl|wget|nc |Invoke-WebRequest|Invoke-RestMethod' <hook-file>
   ```

   Any hit needs a documented justification and explicit user approval.

4. **Scan for silent failure.** Error suppression hides both bugs and attacks:

   ```sh
   rg -n '\|\| true|2>/dev/null|2>\$null|exit 0' <hook-file>
   ```

   A hook that swallows its own failures cannot be trusted to gate anything.

5. **Check scope and privilege.** Does the body read or write outside the repo? Does it touch credentials, dotfiles, or agent config? Flag absolute paths and home-directory access.

6. **Classify and report.** Use the same levels as the security-audit command: P0 direct risk (injection, exfiltration, secret access) — do not enable; P1 weakened controls (suppression, over-broad matcher) — fix before enabling; Note — best-practice gap, log it.

## Output

- A per-hook verdict: enable, fix-then-enable, or reject
- Findings listed with level, line reference, and a concrete fix each
- An explicit "no findings" statement when the hook is clean

## Verification

- [ ] Trigger event and matcher breadth were identified before reading the body
- [ ] Injection, network, and suppression scans were actually run, not eyeballed
- [ ] Every P0/P1 finding carries a line reference and a concrete fix
- [ ] No hook was enabled during the review — the verdict and the enablement are separate, user-approved steps

## Failure Modes

- **Eyeball-only review** — skimming the body instead of running the scans lets obfuscated interpolation through.
- **Reviewing one file, enabling another** — the content reviewed must be exactly what gets enabled, byte for byte.
- **Matcher blindness** — a benign-looking body behind a catch-all matcher still runs everywhere; breadth is part of the risk.
- **Review-as-enablement** — this skill ends with a verdict; turning the hook on is a separate, explicit user decision.
