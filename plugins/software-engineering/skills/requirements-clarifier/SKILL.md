---
name: requirements-clarifier
description: Turn vague implementation requests into testable requirements before coding.
---

<Purpose>
Requirements Clarifier implements Socratic questioning with mathematical ambiguity scoring. It replaces vague ideas with crystal-clear specifications by asking targeted questions that expose hidden assumptions, measuring clarity across weighted dimensions, and refusing to proceed until ambiguity drops below the resolved threshold. The output feeds into planning and execution, ensuring maximum clarity at every stage.
</Purpose>

<Use_When>
- User has a vague idea and wants thorough requirements gathering before execution
- User says "deep interview", "interview me", "ask me everything", "don't assume", "make sure you understand"
- User wants to avoid "that's not what I meant" outcomes from autonomous execution
- Task is complex enough that jumping to code would waste cycles on scope discovery
- User wants mathematically-validated clarity before committing to execution
</Use_When>

<Do_Not_Use_When>
- User has a detailed, specific request with file paths, function names, or acceptance criteria -- execute directly
- User wants to explore options or brainstorm -- use the plan skill instead
- User wants a quick fix or single change -- execute directly
- User says "just do it" or "skip the questions" -- respect their intent
</Do_Not_Use_When>

<Execution_Policy>
- Ask ONE question at a time -- never batch multiple questions
- Target the WEAKEST clarity dimension with each question
- Make weakest-dimension targeting explicit every round: name the weakest dimension, state its score/gap, and explain why the next question is aimed there
- Gather codebase facts via an explore agent BEFORE asking the user about them (inspect the repo instead)
- For brownfield confirmation questions, cite the repo evidence that triggered the question (file path, symbol, or pattern) instead of asking the user to rediscover it
- Score ambiguity after every answer -- display the score transparently
- Do not proceed to execution until ambiguity ≤ the resolved threshold for this run
- Allow early exit with a clear warning if ambiguity is still high
</Execution_Policy>

<Steps>

## Phase 1: Initialize

1. **Parse the user's idea**
2. **Detect brownfield vs greenfield**:
   - Check if cwd has existing source code, package files, or git history
   - If source files exist AND the user's idea references modifying/extending something: **brownfield**
   - Otherwise: **greenfield**
3. **For brownfield**: Explore relevant codebase areas
4. **Set ambiguity threshold**: Default 0.2 (20%)

5. **Announce the interview** to the user:

> Starting requirements clarification. I'll ask targeted questions to understand your idea thoroughly before building anything. After each answer, I'll show your clarity score. We'll proceed once ambiguity drops below 20%.
>
> **Your idea:** "{initial_idea}"
> **Project type:** {greenfield|brownfield}
> **Current ambiguity:** 100%

## Phase 2: Interview Loop

Repeat until `ambiguity ≤ threshold` OR user exits early:

### Step 2a: Generate Next Question

**Question targeting strategy:**
- Identify the dimension with the LOWEST clarity score
- Generate a question that specifically improves that dimension
- State, in one sentence before the question, why this dimension is now the bottleneck
- Questions should expose ASSUMPTIONS, not gather feature lists

**Question styles by dimension:**
| Dimension | Question Style | Example |
|-----------|---------------|---------|
| Goal Clarity | "What exactly happens when...?" | "When you say 'manage tasks', what specific action does a user take first?" |
| Constraint Clarity | "What are the boundaries?" | "Should this work offline, or is internet connectivity assumed?" |
| Success Criteria | "How do we know it works?" | "If I showed you the finished product, what would make you say 'yes, that's it'?" |
| Context Clarity (brownfield) | "How does this fit?" | "I found JWT auth middleware in `src/auth/`. Should this feature extend that path or diverge?" |

### Step 2b: Ask the Question

Present it with the current ambiguity context:

```
Round {n} | Targeting: {weakest_dimension} | Why now: {rationale} | Ambiguity: {score}%

{question}
```

### Step 2c: Score Ambiguity

After receiving the user's answer, score clarity across all dimensions.

Greenfield: `ambiguity = 1 - (goal × 0.40 + constraints × 0.30 + criteria × 0.30)`
Brownfield: `ambiguity = 1 - (goal × 0.35 + constraints × 0.25 + criteria × 0.25 + context × 0.15)`

### Step 2d: Report Progress

After scoring, show the user their progress:

```
Round {n} complete.

| Dimension | Score | Weight | Weighted | Gap |
|-----------|-------|--------|----------|-----|
| Goal | {s} | {w} | {s*w} | {gap or "Clear"} |
| Constraints | {s} | {w} | {s*w} | {gap or "Clear"} |
| Success Criteria | {s} | {w} | {s*w} | {gap or "Clear"} |
| **Ambiguity** | | | **{score}%** | |

{score <= threshold ? "Clarity threshold met! Ready to proceed." : "Focusing next question on: {weakest_dimension}"}
```

### Step 2e: Check Soft Limits

- **Round 3+**: Allow early exit if user says "enough", "let's go", "build it"
- **Round 10**: Show soft warning: "We're at 10 rounds. Current ambiguity: {score}%. Continue or proceed?"
- **Round 20**: Hard cap: "Maximum rounds reached. Proceeding with current clarity level ({score}%)."

## Phase 3: Challenge Agents

At specific round thresholds, shift the questioning perspective:

### Round 4+: Contrarian Mode
Challenge the user's core assumption. Ask "What if the opposite were true?" or "What if this constraint doesn't actually exist?"

### Round 6+: Simplifier Mode
Probe whether complexity can be removed. Ask "What's the simplest version that would still be valuable?"

### Round 8+: Ontologist Mode (if ambiguity still > 0.3)
The ambiguity is still high after 8 rounds, suggesting we may be addressing symptoms rather than the core problem. Ask "What IS this, really?"

Challenge modes are used ONCE each, then return to normal Socratic questioning.

## Phase 4: Crystallize Spec

When ambiguity ≤ threshold (or hard cap / early exit):

1. **Generate the specification**
2. **Write to file**: `.specs/requirements-clarifier-{slug}.md`

Spec structure:

```markdown
# Requirements Spec: {title}

## Metadata
- Rounds: {count}
- Final Ambiguity Score: {score}%
- Type: greenfield | brownfield

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
...

## Goal
{crystal-clear goal statement}

## Constraints
- {constraint 1}

## Non-Goals
- {explicitly excluded scope}

## Acceptance Criteria
- [ ] {testable criterion 1}

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
...
```

## Phase 5: Execution Bridge

After the spec is written, present execution options:

1. **Execute with full planning** — Plan then implement with verification
2. **Execute directly** — Implement from spec, no additional planning
3. **Refine further** — Continue interviewing to improve clarity

</Steps>

<Escalation_And_Stop_Conditions>
- **Hard cap at 20 rounds**: Proceed with whatever clarity exists, noting the risk
- **Soft warning at 10 rounds**: Offer to continue or proceed
- **Early exit (round 3+)**: Allow with warning if ambiguity > threshold
- **User says "stop", "cancel", "abort"**: Stop immediately
- **Ambiguity stalls** (same score +-0.05 for 3 rounds): Activate Ontologist mode to reframe
</Escalation_And_Stop_Conditions>

<Final_Checklist>
- [ ] Interview completed (ambiguity ≤ threshold OR user chose early exit)
- [ ] Ambiguity score displayed after every round
- [ ] Every round explicitly names the weakest dimension
- [ ] Challenge agents activated at correct thresholds (round 4, 6, 8)
- [ ] Spec file written
- [ ] Spec includes: goal, constraints, acceptance criteria, clarity breakdown
</Final_Checklist>
