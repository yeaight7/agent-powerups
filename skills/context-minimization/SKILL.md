---
name: context-minimization
description: Use when a task runs long and the context window is filling -- large files are being read whole, command output is flooding the transcript, or responses are getting verbose and slow.
---

## Purpose

Your context window is the most precious resource. Large contexts make you slow, expensive, and prone to hallucinations. Treat every token read or written as a cost, and apply a continuous discipline: read less, output less, keep the window lean.

## When to Use

- Continuously during any long, multi-step task
- About to open a large file (hundreds or thousands of lines)
- A command is about to emit massive logs (installs, verbose builds)
- Responses are drifting into explanation and restatement

## Inputs

- The current task and the files/commands it requires
- Awareness of which files are large enough to need targeted reads

## Workflow

1. **Before reading: search, do not slurp.** Never read a 2,000-line file whole. Locate the relevant region first, then read only that range.

   ```bash
   grep -n "functionName" src/module.ts   # find the line numbers
   ```
   Then read only the surrounding window (e.g. lines 120-160), not the entire file.

2. **While reading: parallelize, do not serialize.** If you need to inspect 3 files, issue 3 reads/searches in a single turn rather than one per turn. Fewer turns means less context repetition.

3. **When running commands: silence the noise.** Suppress bulk output unless you need it to debug, and disable pagers so output is not re-printed.

   ```bash
   npm install --silent           # drop install chatter (-q on tools that use it)
   git --no-pager log -n 20       # no interactive pager
   some-build 2>/dev/null         # discard stderr you do not need
   ```

4. **When outputting: stay terse.** Do not explain what a tool does before calling it unless safety requires it. Do not repeat the user's instructions back verbatim. State the result, not the process.

5. **After reading: close the file.** Once you are done with a file, stop referring to it and do not re-read it. The harness already tracks what you have seen.

## Output

- Targeted reads of only the needed line ranges
- Quiet, pager-free command invocations
- Concise responses with no restatement or pre-call narration

## Verification

- [ ] No whole-file read of a large file without a line range
- [ ] Searched for line numbers before reading a large file
- [ ] Independent reads/searches batched into a single turn
- [ ] Noisy commands silenced and pagers disabled
- [ ] Responses contain no instruction restatement or tool pre-explanation

## Failure Modes

- **Slurping the whole file** — reading an entire large file when a grep-located range would do; it floods context and buries the relevant lines.
- **Serial reads** — opening files one per turn instead of batching, multiplying context repetition across turns.
- **Log flooding** — running verbose installs or builds without silencing, drowning the transcript in output you never needed.
- **Narrating everything** — restating instructions and pre-explaining tool calls, spending output tokens on filler.
