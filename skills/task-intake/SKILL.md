---
name: task-intake
description: Use at the start of a new task -- before writing or editing code -- when the request is vague, the scope boundaries are unclear, or the acceptance criteria for "done" have not been stated.
---

## Purpose

Never start implementing blindly. When you receive a new task, force clarification of boundaries and expected outcomes before touching files. A few minutes of intake prevents building the wrong thing.

## When to Use

- At the beginning of any new task, before the first edit
- The request is ambiguous, broad, or missing files, logs, or environment details
- You cannot yet state how the result will be tested or what is out of scope

## Inputs

- The user's task request
- Read access to the repo (to confirm files and the current state exist)

## Workflow

1. **Restate the goal.** Summarize the user's request in your own words and ask them to confirm. A probing question here: "You want X to do Y instead of Z — is that right?"
2. **Pin down scope.** Identify explicitly what you are *not* going to do. If the user asked to fix a button, do not refactor the routing layer. Ask: "Should this change touch only the button handler, or is the surrounding component in scope too?"
3. **Define how it will be tested.** Decide the validation criteria up front — a unit test, a manual UI check, or a command. Ask: "How will we confirm this works — a passing test, or a manual check I should run?"

   ```bash
   npm test            # if the change is unit-testable
   curl -s localhost:3000/health   # if it is an endpoint
   ```
4. **Surface missing context.** If the request is too vague to act on, ask for the specific files, logs, or environment details you need. Confirm the targets exist before claiming you understand them.

   ```bash
   git grep -n "handleSubmit"   # confirm the symbol exists
   git ls-files "src/**/*.tsx"  # confirm the area you'll edit
   ```
5. **State understanding, then pause if ambiguous.** Do not say "I will now fix the bug" and immediately edit files. State your understanding of the problem first; if the instruction is ambiguous, explicitly pause and ask a clarifying question instead of guessing.

## Output

- A one-paragraph restatement of the goal in your own words
- An explicit out-of-scope list
- A stated validation method (test, manual check, or command)
- Any clarifying questions, or confirmation that none remain

## Verification

- [ ] The goal is restated in your own words and confirmed with the user
- [ ] What is out of scope is named explicitly
- [ ] The validation method (test, manual check, or command) is decided before editing
- [ ] Referenced files and symbols are confirmed to exist before claiming understanding
- [ ] Ambiguities are raised as clarifying questions, not resolved by guessing

## Failure Modes

- **The blind start** — saying "I will now fix the bug" and editing files before confirming they exist or what success means.
- **Silent scope creep** — fixing the button but also refactoring unrelated layers because the boundary was never named.
- **Untestable hand-off** — finishing without ever deciding how the result would be validated.
- **Guessing through ambiguity** — inventing an interpretation of a vague request instead of pausing to ask.
