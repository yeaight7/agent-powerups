---
name: root-cause-tracing
description: Trace bugs backward through the call chain to find the original trigger, not just the symptom.
---

# Root Cause Tracing

## Overview

Bugs often manifest deep in the call stack. Your instinct is to fix where the error appears, but that treats a symptom.

**Core principle:** Trace backward through the call chain until you find the original trigger, then fix at the source.

## When to Use

- Error happens deep in execution, not at the entry point.
- Stack trace shows a long call chain.
- Unclear where invalid data originated.
- Need to find which test or code path triggers the problem.

## The Tracing Process

### 1. Observe the Symptom

```bash
Error: git init failed in /project/packages/core
```

### 2. Find Immediate Cause

What code directly causes this?

```typescript
await execFileAsync('git', ['init'], { cwd: projectDir });
```

### 3. Ask: What Called This?

```
WorktreeManager.createSessionWorktree(projectDir, sessionId)
  → called by Session.initializeWorkspace()
  → called by Session.create()
  → called by test at Project.create()
```

### 4. Keep Tracing Up

What value was passed?

- `projectDir = ''` (empty string)
- Empty string as `cwd` resolves to `process.cwd()`
- That's the source code directory.

### 5. Find Original Trigger

Where did the empty string come from?

```typescript
const context = setupCoreTest(); // Returns { tempDir: '' }
Project.create('name', context.tempDir); // Accessed before beforeEach!
```

## Adding Stack Traces

When you cannot trace manually, add instrumentation:

```typescript
async function gitInit(directory: string) {
  const stack = new Error().stack;
  console.error('DEBUG git init:', {
    directory,
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
    stack,
  });

  await execFileAsync('git', ['init'], { cwd: directory });
}
```

Use `console.error()` in tests — logger output may be suppressed.

Capture and analyze:

```bash
npm test 2>&1 | grep 'DEBUG git init'
```

## Finding Which Test Causes Pollution

If something appears during tests but you don't know which test:

```bash
./references/find-polluter.sh '.git' 'src/**/*.test.ts'
```

Runs tests one-by-one, stops at the first polluter.

## Example

Bug: `.git` created in `packages/core/` (source code directory).

Trace chain:

1. `git init` runs in `process.cwd()` ← empty cwd parameter
2. WorktreeManager called with empty projectDir
3. Session.create() passed empty string
4. Test accessed `context.tempDir` before `beforeEach`
5. `setupCoreTest()` returns `{ tempDir: '' }` at initialization time

Root cause: Top-level variable initialization accessing an empty value.

Fix: Made `tempDir` a getter that throws if accessed before `beforeEach`.

Also added defense-in-depth (see `defense-in-depth.md`).

## Key Principle

NEVER fix just where the error appears. Trace back to find the original trigger.

## Stack Trace Tips

- Use `console.error()` in tests, not logger — logger may be suppressed.
- Log before the dangerous operation, not after it fails.
- Include directory, cwd, environment variables, and timestamps.
- Use `new Error().stack` to capture the complete call chain.
