---
name: webapp-visual-testing
description: Use when a browser-facing UI needs visual verification, a layout bug or visual regression is reported, accessibility of an interactive component needs checking, or a browser workflow must be exercised end-to-end.
---

# Webapp Visual Testing

Collect visual and behavioral evidence from a web UI before declaring a feature complete or a bug fixed.

## When to Use

- A feature has a browser-facing UI component that requires visual verification
- A layout bug or visual regression is reported
- Accessibility of a new interactive component needs checking
- A browser-based workflow (form, navigation, auth, modal) must be exercised end-to-end
- A screenshot comparison is needed between two states or builds

**Safety policy** is handled by the `browser-automation-safety` skill — read it first if this is your first time using browser automation in this environment. **Playwright MCP setup** is in `mcp/generic/playwright.json`.

This skill covers the testing workflow: what to test, how to capture evidence, and how to report findings.

## Inputs

- Target URL or localhost route (dev server must be running)
- Feature or interaction to test
- Expected visual or behavioral outcome
- Browser capability available: Playwright MCP, `@playwright/test`, or user-supplied screenshots

## Workflow

### 1. Confirm prerequisites

```bash
# Check dev server
curl -s -o /dev/null -w "%{http_code}" http://localhost:<port>   # expect 200

# Check browser capability
apx mcp check playwright    # if using Playwright MCP
npx playwright --version    # if using @playwright/test
```

If no browser capability is available: ask the user for screenshots and continue with static analysis only.

### 2. Take a baseline snapshot

Navigate to the target URL and capture the initial state:

```
browser_navigate(url)
browser_snapshot()           # accessibility tree — roles, labels, focusable elements
browser_take_screenshot()    # visual state
browser_console_messages()   # check for load-time errors
```

Flag any console errors at page load before proceeding.

### 3. Exercise the interaction

Use semantic selectors in priority order (from `browser-automation-safety`):

1. ARIA role + accessible name: `getByRole('button', { name: 'Submit' })`
2. Visible text: `getByText('Continue')`
3. Label: `getByLabel('Email address')`
4. Test ID: `getByTestId('submit-btn')`
5. Stable CSS selector: `.submit-btn`
6. ⚠ Avoid: XPath, coordinate clicks, generated class names

Capture a screenshot after each significant state change: modal open, form submit, navigation, error state.

### 4. Check functional signals

| Signal | Check |
|---|---|
| Console errors | Any uncaught exceptions or network errors after interaction? |
| Network requests | Did the expected API call fire? Did it return a success status? |
| DOM changes | Did the expected element appear / disappear / update? |
| Accessibility | Are new elements keyboard-reachable and labelled correctly? |

### 5. Document findings per scenario

```md
SCENARIO: <what was tested>
EXPECTED: <what should happen>
OBSERVED: <what actually happened>
EVIDENCE: <screenshot filename or console excerpt>
STATUS: PASS / FAIL / NEEDS_REVIEW

ISSUES FOUND:
  [critical] <description> — <evidence reference>
  [major]    <description>
  [minor]    <description>

ACCESSIBILITY:
  <element>: role=<role>, label=<label>, keyboard=reachable/unreachable
```

### 6. Visual regression check (when a baseline exists)

If a prior screenshot is available:

- Compare side-by-side for layout shifts, color changes, missing elements, overflow
- Do not auto-approve visual diffs — present them and let the user decide

## Output

Deliver:

1. Screenshot filenames saved to a named artifact path (not system temp)
2. Console error count and any non-trivial messages from load and interactions
3. Per-scenario PASS / FAIL / NEEDS_REVIEW verdict
4. Accessibility summary for new or changed interactive elements
5. Visual regression notes if a prior baseline exists

## Verification

- At least one screenshot captured per tested scenario
- Console errors checked at page load and after each interaction
- All interactive elements in scope have accessible names and labels
- Artifacts saved to a named path and reported to the user

## Failure Modes

- Dev server not running — check the port before navigating; do not guess at a URL
- Browser capability missing — fall back to static HTML/CSS inspection + user screenshots
- Page renders blank — check console errors before assuming a layout issue
- Flaky outcome due to animation — use `waitFor` or take screenshots after animations settle

## Sources / Inspiration

Inspired by `anthropics/skills` `webapp-testing/SKILL.md`. Extended with accessibility and visual regression guidance. Safety policy delegated to `browser-automation-safety`.
