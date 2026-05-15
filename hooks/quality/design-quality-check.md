# design-quality-check

**Type:** PostToolUse hook recipe — review before use, not auto-applied.

## Purpose

After writing or editing a frontend/UI file, remind the agent that visual and behavioral verification is required before claiming the feature is complete. UI changes that pass type checks and unit tests can still be visually broken, inaccessible, or broken across viewport sizes.

## Trigger Suggestion

```
PostToolUse → tool in [Write, Edit]
  AND target path matches UI file pattern
```

## Matcher Patterns

Flag writes or edits to:

| Pattern | Type |
|---|---|
| `*.tsx`, `*.jsx` | React components |
| `*.vue` | Vue components |
| `*.svelte` | Svelte components |
| `components/**`, `pages/**`, `app/**` | Route/component directories |
| `styles/**`, `*.css`, `*.scss`, `*.sass` | Stylesheets |
| `tailwind.config.*` | Tailwind configuration |
| `theme.*`, `tokens.*` | Design tokens |

## Behavior

When a UI file is written or edited:

1. Print: `[design-quality-check] UI file modified — visual review recommended:`
2. Show the modified file path.
3. Print the review prompt:

```
VISUAL REVIEW REQUIRED BEFORE COMPLETION:

[ ] Dev server running and page renders without console errors
[ ] Component visible and correctly positioned at target viewport(s)
[ ] Interactive states work: hover, focus, active, disabled
[ ] Keyboard navigation and focus order are correct
[ ] No unintended overflow, clipping, or z-index conflict
[ ] Dark mode / light mode (if applicable) renders correctly
[ ] Screenshot captured for before/after comparison (if layout changed)

Use /visual-review or the webapp-visual-testing skill to gather evidence.
```

4. Warn only — do not block file writes.

## Safe Default

Warning mode only. Visual review cannot be automated for all changes; hard-blocking would create friction for trivial CSS fixes.

## Blocking vs Warning Mode

- **Warning (recommended):** Surface the checklist; let the agent continue.
- **Blocking:** Use only when the team requires a screenshot artifact before any UI PR can be merged.

## False-Positive Risks

- Non-visual `.tsx`/`.jsx` files (pure logic components, utility hooks, context providers).
- Test files: `*.test.tsx`, `*.spec.jsx` — these do not render in production.
- Storybook files: `*.stories.tsx` — may or may not need visual review depending on policy.

Consider allowlisting `*.test.*`, `*.spec.*`, and `*.stories.*`.

## Bypass / Approval Mechanism

Agent or user confirms visual review was completed (screenshot taken, or explicitly acknowledges low-risk change). The hook does not require a specific artifact — it requests intent acknowledgment.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# Called with $TARGET_PATH set by the hook runner.

UI_PATTERNS=(
  "\.tsx$" "\.jsx$" "\.vue$" "\.svelte$"
  "/components/" "/pages/" "/app/"
  "\.css$" "\.scss$" "\.sass$"
  "tailwind\.config\."
)

for pattern in "${UI_PATTERNS[@]}"; do
  if echo "$TARGET_PATH" | grep -qE "$pattern"; then
    # Skip test/spec/stories files
    if echo "$TARGET_PATH" | grep -qE "\.(test|spec|stories)\.(tsx|jsx|ts|js)$"; then
      exit 0
    fi
    echo "[design-quality-check] UI file modified: $TARGET_PATH"
    echo "Visual review recommended before completion."
    echo "Use /visual-review or the webapp-visual-testing skill."
    exit 0  # Warning only
  fi
done

exit 0
```

## Sources / Inspiration

Frontend QA checklists from Web Content Accessibility Guidelines (WCAG) and common design system review practices. Complements `webapp-visual-testing` skill and `/visual-review` command in this repository.
