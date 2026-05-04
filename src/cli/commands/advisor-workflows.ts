import type { CliIO } from "../apx.js";
import { hasFlag } from "../utils/args.js";
import { createResult, formatResult } from "../utils/result.js";

export async function runTriReviewCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const task = argv[1];

  if (!task || task.startsWith("--")) {
    io.stderr(
      formatResult(
        createResult({ exitCode: 1, stderr: 'Missing task. Usage: apx tri-review "<task>"' }),
        json,
      ),
    );
    return 1;
  }

  const advisors = [
    {
      provider: "claude",
      focus: "correctness, completeness, edge cases, and failure modes",
      prompt: `Review the following task and identify risks, ambiguities, and missing requirements:\n\n${task}\n\nFocus on: correctness, completeness, edge cases, and failure modes.`,
    },
    {
      provider: "gemini",
      focus: "design tradeoffs, scalability, and maintainability",
      prompt: `Analyze this task from an architecture and design perspective:\n\n${task}\n\nFocus on: design tradeoffs, scalability, and maintainability.`,
    },
    {
      provider: "codex",
      focus: "implementation complexity, testing strategy, and integration points",
      prompt: `Review this task for implementation feasibility:\n\n${task}\n\nFocus on: implementation complexity, testing strategy, and integration points.`,
    },
  ];

  const synthesisChecklist = [
    "Do all three advisors agree on the core approach?",
    "Are there conflicting risk assessments? Investigate the higher-severity view.",
    "Are there missing requirements all advisors flagged independently?",
    "Is the implementation plan feasible given the risks identified?",
    "What is the simplest change that satisfies all constraints?",
  ];

  if (json) {
    io.stdout(
      formatResult(
        createResult({
          stdout: `tri-review: ${task}`,
          data: { task, advisors, synthesisChecklist },
        }),
        true,
      ),
    );
    return 0;
  }

  io.stdout(`Tri-Review: ${task}\n`);
  io.stdout("Advisor Prompts:\n");
  for (const a of advisors) {
    io.stdout(`  [${a.provider.toUpperCase()}] focus: ${a.focus}`);
    io.stdout(`    Run: apx ask-${a.provider} "<paste prompt from --json output>"`);
    io.stdout("");
  }
  io.stdout("Synthesis Checklist:");
  for (const item of synthesisChecklist) io.stdout(`  - ${item}`);
  io.stdout("\nRun with --json to get full advisor prompts.");
  return 0;
}

export async function runClarifyRequirementsCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const request = argv[1];

  if (!request || request.startsWith("--")) {
    io.stderr(
      formatResult(
        createResult({ exitCode: 1, stderr: 'Missing request. Usage: apx clarify-requirements "<request>"' }),
        json,
      ),
    );
    return 1;
  }

  const dimensions = [
    { name: "scope", question: "What is explicitly in-scope vs out-of-scope?" },
    { name: "success", question: "How is success measured? What does done look like?" },
    { name: "constraints", question: "What technical, time, or resource constraints apply?" },
    { name: "risks", question: "What assumptions could invalidate this requirement?" },
    { name: "users", question: "Who are the primary users or consumers of this feature?" },
    { name: "dependencies", question: "What systems or teams does this depend on?" },
  ];

  const questions = dimensions.map((d) => `[${d.name.toUpperCase()}] ${d.question}`);

  if (json) {
    io.stdout(
      formatResult(
        createResult({
          stdout: `clarify-requirements: ${request}`,
          data: {
            request,
            dimensions,
            questions,
            nextStep: "Gather answers, then run: apx phase discuss 1",
          },
        }),
        true,
      ),
    );
    return 0;
  }

  io.stdout(`Requirement Clarification: ${request}\n`);
  io.stdout("Clarification dimensions:\n");
  for (const q of questions) io.stdout(`  ${q}`);
  io.stdout("\nNext: gather answers, then run: apx phase discuss 1");
  return 0;
}

export async function runParallelWorkCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const subcommand = argv[1];

  if (subcommand !== "plan") {
    io.stderr(
      formatResult(
        createResult({ exitCode: 1, stderr: 'Usage: apx parallel-work plan "<task>"' }),
        json,
      ),
    );
    return 1;
  }

  const task = argv[2];
  if (!task || task.startsWith("--")) {
    io.stderr(
      formatResult(
        createResult({ exitCode: 1, stderr: 'Missing task. Usage: apx parallel-work plan "<task>"' }),
        json,
      ),
    );
    return 1;
  }

  const waves = [
    {
      wave: 1,
      label: "Foundation",
      tasks: ["Identify shared interfaces, types, and contracts", "Set up scaffolding and test harness"],
      rationale: "No dependencies — unblocks all parallel work",
    },
    {
      wave: 2,
      label: "Parallel execution",
      tasks: [
        "Implement module A (independent)",
        "Implement module B (independent)",
        "Write unit tests per module",
      ],
      rationale: "Depends only on Wave 1 contracts",
    },
    {
      wave: 3,
      label: "Integration",
      tasks: ["Wire modules together", "Run integration tests", "Fix cross-module issues"],
      rationale: "Requires Wave 2 complete",
    },
  ];

  const mergeStrategy =
    "Complete each wave fully before starting the next. Use feature branches per module in Wave 2.";
  const commitBoundary =
    'git commit -m "feat: complete wave {N} — {label}" (after each wave; user-controlled, not automatic)';

  if (json) {
    io.stdout(
      formatResult(
        createResult({
          stdout: `parallel-work plan: ${task}`,
          data: { task, waves, mergeStrategy, commitBoundary },
        }),
        true,
      ),
    );
    return 0;
  }

  io.stdout(`Parallel Work Plan: ${task}\n`);
  for (const w of waves) {
    io.stdout(`Wave ${w.wave}: ${w.label}`);
    for (const t of w.tasks) io.stdout(`  - ${t}`);
    io.stdout(`  Rationale: ${w.rationale}`);
    io.stdout("");
  }
  io.stdout(`Commit boundary: ${commitBoundary}`);
  return 0;
}

export async function runFinishLoopCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const subcommand = argv[1];

  if (subcommand !== "plan") {
    io.stderr(
      formatResult(
        createResult({ exitCode: 1, stderr: 'Usage: apx finish-loop plan "<task>"' }),
        json,
      ),
    );
    return 1;
  }

  const task = argv[2];
  if (!task || task.startsWith("--")) {
    io.stderr(
      formatResult(
        createResult({ exitCode: 1, stderr: 'Missing task. Usage: apx finish-loop plan "<task>"' }),
        json,
      ),
    );
    return 1;
  }

  const completionCriteria = [
    "All planned tests pass with no new failures",
    "All declared acceptance criteria are verified",
    "No unresolved TODOs or placeholder implementations remain",
    "Artifact builds cleanly from a fresh checkout",
    "Change is documented in commit messages or PR description",
  ];

  const verificationSteps = [
    { step: 1, action: "Run full test suite", command: "npm test" },
    { step: 2, action: "Run security audit", command: "apx security-audit --path ." },
    { step: 3, action: "Run ship check", command: "apx ship-check" },
    { step: 4, action: "Verify against acceptance criteria", command: "apx phase verify <phase>" },
    { step: 5, action: "Mark phase complete in STATE.md", command: "(manual)" },
  ];

  const loopBehavior =
    "If any step fails, return to the relevant execution wave and fix before re-running. Never close the loop with known failures.";

  if (json) {
    io.stdout(
      formatResult(
        createResult({
          stdout: `finish-loop plan: ${task}`,
          data: { task, completionCriteria, verificationSteps, loopBehavior },
        }),
        true,
      ),
    );
    return 0;
  }

  io.stdout(`Finish Loop: ${task}\n`);
  io.stdout("Completion criteria:");
  for (const c of completionCriteria) io.stdout(`  - ${c}`);
  io.stdout("\nVerification steps:");
  for (const v of verificationSteps) io.stdout(`  ${v.step}. ${v.action}  (${v.command})`);
  io.stdout(`\nLoop behavior: ${loopBehavior}`);
  return 0;
}
