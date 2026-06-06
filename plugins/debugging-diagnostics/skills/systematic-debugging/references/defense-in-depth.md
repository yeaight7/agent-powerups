---
name: defense-in-depth
description: Add validation at multiple layers to make a bug structurally impossible, not just fixed at one point.
---

# Defense-in-Depth Validation

## Overview

When you fix a bug caused by invalid data, adding validation at one place feels sufficient. But that single check can be bypassed by different code paths, refactoring, or mocks.

**Core principle:** Validate at EVERY layer data passes through. Make the bug structurally impossible.

## The Four Layers

### Layer 1: Entry Point Validation

Reject obviously invalid input at the API boundary.

```typescript
function createProject(name: string, workingDirectory: string) {
  if (!workingDirectory || workingDirectory.trim() === '') {
    throw new Error('workingDirectory cannot be empty');
  }
  if (!existsSync(workingDirectory)) {
    throw new Error(`workingDirectory does not exist: ${workingDirectory}`);
  }
  if (!statSync(workingDirectory).isDirectory()) {
    throw new Error(`workingDirectory is not a directory: ${workingDirectory}`);
  }
}
```

### Layer 2: Business Logic Validation

Ensure data makes sense for this specific operation.

```typescript
function initializeWorkspace(projectDir: string, sessionId: string) {
  if (!projectDir) {
    throw new Error('projectDir required for workspace initialization');
  }
}
```

### Layer 3: Environment Guards

Prevent dangerous operations in specific contexts (e.g., tests).

```typescript
async function gitInit(directory: string) {
  if (process.env.NODE_ENV === 'test') {
    const normalized = normalize(resolve(directory));
    const tmpDir = normalize(resolve(tmpdir()));

    if (!normalized.startsWith(tmpDir)) {
      throw new Error(
        `Refusing git init outside temp dir during tests: ${directory}`
      );
    }
  }
}
```

### Layer 4: Debug Instrumentation

Capture context for forensics when other layers fail.

```typescript
async function gitInit(directory: string) {
  const stack = new Error().stack;
  logger.debug('About to git init', {
    directory,
    cwd: process.cwd(),
    stack,
  });
}
```

## Applying the Pattern

When you find a bug:

1. Trace the data flow — where does the bad value originate? Where is it used?
2. Map all checkpoints — list every point data passes through.
3. Add validation at each layer — entry, business, environment, debug.
4. Test each layer — try to bypass layer 1, verify layer 2 catches it.

## Example

Bug: Empty `projectDir` caused `git init` to run in the source code directory.

Data flow:

1. Test setup → empty string
2. `Project.create(name, '')`
3. `WorkspaceManager.createWorkspace('')`
4. `git init` runs in `process.cwd()`

Four layers added:

- Layer 1: `Project.create()` validates not empty/exists/writable
- Layer 2: `WorkspaceManager` validates projectDir not empty
- Layer 3: `WorktreeManager` refuses git init outside tmpdir in tests
- Layer 4: Stack trace logging before git init

Result: All 1847 tests passed, bug impossible to reproduce.

## Key Insight

All four layers are necessary. During testing, each layer catches bugs the others miss:

- Different code paths bypass entry validation.
- Mocks bypass business logic checks.
- Edge cases on different platforms need environment guards.
- Debug logging identifies structural misuse.

Don't stop at one validation point. Add checks at every layer.
