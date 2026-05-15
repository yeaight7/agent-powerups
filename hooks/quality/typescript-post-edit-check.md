# typescript-post-edit-check

**Type:** PostToolUse hook recipe — review before use, not auto-applied.

## Purpose

After editing a TypeScript or TSX file, suggest a focused TypeScript type check. Catches type errors introduced by the edit before they accumulate or block CI. Specifically targets TypeScript-heavy repos where type errors are a common failure mode.

This is a specialized variant of `quality-gate-after-edit`, focused only on TypeScript. Use this alongside or instead of the general hook in TypeScript-first repos.

## Trigger Suggestion

```
PostToolUse → tool in [Write, Edit]
  AND target path matches *.ts or *.tsx
  AND target path does not match test/spec/generated patterns (optional)
```

## Matcher Patterns

Flag edits to:

| Pattern | Notes |
|---|---|
| `*.ts` | TypeScript source files |
| `*.tsx` | TypeScript JSX (React) |

Optional exclusions:

| Pattern | Reason |
|---|---|
| `*.test.ts`, `*.spec.ts` | Test files — still valid to check, but lower priority |
| `*.d.ts` | Type declaration files — auto-generated; changes are usually structural |
| `dist/**`, `build/**` | Output directories — not source |

## Behavior

When a TypeScript file is written or edited:

1. Print: `[typescript-post-edit-check] TypeScript file modified: <file path>`
2. Detect the available type check command:
   - If `package.json` contains a `typecheck` or `type-check` script: suggest `npm run typecheck` (or `pnpm`, `yarn` equivalent).
   - If `tsconfig.json` exists at root: suggest `tsc --noEmit`.
   - If neither is found: warn that no typecheck configuration was detected.
3. Print the suggestion:

```
TYPE CHECK RECOMMENDED:
  <detected command>

Run narrowly where possible:
  tsc --noEmit --skipLibCheck   (faster, skips lib types)

If this is a large project, run only on changed files or use ts-project-references.
```

4. Warn only — do not run the command automatically.

## Safe Default

Non-blocking suggestion. The hook detects the correct command but does not execute it.

## Blocking vs Warning Mode

- **Warning (recommended):** Print the type-check command; let the agent continue.
- **Blocking (optional):** Intercept a Stop signal if no type check was run after TypeScript edits in the session.

## False-Positive Risks

- Repos that don't use strict TypeScript or intentionally skip type checking.
- `.d.ts` files — changes are usually auto-generated and don't benefit from a separate type check run.
- Repos where `tsc --noEmit` takes a long time — the suggestion may be impractical per-edit.

## Bypass / Approval Mechanism

Agent explicitly states "type check not required" (e.g., trivial rename, comment change). User acknowledges. In warning mode, no formal bypass is needed.

## Relationship to quality-gate-after-edit

`quality-gate-after-edit` covers TypeScript in its general language map. Use this hook instead for TypeScript-first repos where the extra detail (script detection, narrowing hints) adds value. Do not run both if they produce duplicate output for `.ts` files.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# Called with $TARGET_PATH set by the hook runner.

# Match only .ts and .tsx (not .d.ts)
if ! echo "$TARGET_PATH" | grep -qE '\.(ts|tsx)$'; then
  exit 0
fi
if echo "$TARGET_PATH" | grep -qE '\.d\.ts$'; then
  exit 0
fi

echo "[typescript-post-edit-check] TypeScript file modified: $TARGET_PATH"

# Detect typecheck command
TYPECHECK_CMD=""
if [ -f "package.json" ] && grep -q '"typecheck"' package.json 2>/dev/null; then
  TYPECHECK_CMD="npm run typecheck"
elif [ -f "package.json" ] && grep -q '"type-check"' package.json 2>/dev/null; then
  TYPECHECK_CMD="npm run type-check"
elif [ -f "tsconfig.json" ]; then
  TYPECHECK_CMD="tsc --noEmit"
else
  echo "[typescript-post-edit-check] Warning: no tsconfig.json or typecheck script detected."
  exit 0
fi

echo "Type check recommended: $TYPECHECK_CMD"
echo "Narrow: tsc --noEmit --skipLibCheck (faster)"
exit 0  # Warning only
```

## Sources / Inspiration

TypeScript project tooling patterns and tsc usage guides. Specialized variant of the `quality-gate-after-edit` hook. Complements `build-analysis-post` for CI-level analysis.
