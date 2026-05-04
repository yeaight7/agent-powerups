import fs from "node:fs/promises";
import path from "node:path";
import type { CliIO } from "../apx.js";
import { hasFlag, parseOption } from "../utils/args.js";
import { createResult, formatResult } from "../utils/result.js";

const DEFAULT_PLANNING_ROOT = ".agent-powerups/planning";
const DEFAULT_CODEBASE_DEST = ".agent-powerups/codebase";

export async function runProjectInitCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const yes = hasFlag(argv, "--yes");
  const dest = parseOption(argv, "--dest") ?? path.join(io.cwd, DEFAULT_PLANNING_ROOT);

  const artifacts = [
    {
      file: "PROJECT.md",
      content: "# Project\n\n## Goal\n\n## Scope\n\n## Success Criteria\n",
    },
    {
      file: "config.json",
      content: JSON.stringify({ version: "0.1.0", phases: [] }, null, 2) + "\n",
    },
    {
      file: "REQUIREMENTS.md",
      content: "# Requirements\n\n## Functional\n\n## Non-Functional\n",
    },
    {
      file: "ROADMAP.md",
      content: "# Roadmap\n\n## Phase 1\n\n## Phase 2\n",
    },
    {
      file: "STATE.md",
      content: "# State\n\n## Current Phase\n\n## Completed\n\n## In Progress\n",
    },
  ];

  if (!yes) {
    if (json) {
      io.stdout(
        formatResult(
          createResult({
            stdout: `project init dry-run: ${dest}`,
            data: {
              planningRoot: dest,
              dryRun: true,
              artifacts: artifacts.map((a) => ({
                file: a.file,
                path: path.join(dest, a.file),
                action: "create",
              })),
            },
          }),
          true,
        ),
      );
    } else {
      io.stdout("Project init (dry-run):");
      io.stdout(`dest: ${dest}`);
      io.stdout("safety: no files written\n");
      for (const a of artifacts) io.stdout(`  would create: ${path.join(dest, a.file)}`);
      io.stdout("\n(Run with --yes to create files)");
    }
    return 0;
  }

  await fs.mkdir(dest, { recursive: true });
  const created: string[] = [];
  const skipped: string[] = [];

  for (const a of artifacts) {
    const filePath = path.join(dest, a.file);
    try {
      await fs.access(filePath);
      skipped.push(filePath);
    } catch {
      await fs.writeFile(filePath, a.content, "utf8");
      created.push(filePath);
    }
  }

  if (json) {
    io.stdout(
      formatResult(
        createResult({
          stdout: `project init: ${dest}`,
          data: { planningRoot: dest, dryRun: false, created, skipped },
        }),
        true,
      ),
    );
  } else {
    io.stdout(`Project init: ${dest}`);
    io.stdout(`Created: ${created.length} file(s)`);
    if (skipped.length > 0) io.stdout(`Skipped (already exist): ${skipped.length}`);
  }
  return 0;
}

export async function runPhaseDiscussCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const phase = argv[argv.indexOf("discuss") + 1];

  if (!phase || phase.startsWith("--")) {
    io.stderr(
      formatResult(
        createResult({ exitCode: 1, stderr: "Missing phase number. Usage: apx phase discuss <phase>" }),
        json,
      ),
    );
    return 1;
  }

  const planningRoot =
    parseOption(argv, "--planning-root") ?? path.join(io.cwd, DEFAULT_PLANNING_ROOT);

  const discussionPrompt = `You are entering the discussion phase for Phase ${phase}.

Review if they exist:
- PROJECT.md — project goals and scope
- REQUIREMENTS.md — functional and non-functional requirements
- ROADMAP.md — planned phase structure

Clarify for Phase ${phase}:
1. What are the acceptance criteria?
2. What dependencies or blockers exist?
3. Are there open questions that must be answered before planning can begin?
4. What is the definition of done?

Output: a clear statement of Phase ${phase} goals and any open questions to resolve before /plan-phase.`;

  if (json) {
    io.stdout(
      formatResult(
        createResult({
          stdout: `phase discuss: phase ${phase}`,
          data: {
            phase,
            planningRoot,
            discussionPrompt,
            nextStep: `apx phase plan ${phase} --planning-root ${planningRoot}`,
          },
        }),
        true,
      ),
    );
    return 0;
  }

  io.stdout(`Phase ${phase} — Discussion\n`);
  io.stdout(`Planning root: ${planningRoot}\n`);
  io.stdout(discussionPrompt);
  io.stdout(`\nNext: apx phase plan ${phase}`);
  return 0;
}

export async function runPhasePlanCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const phase = argv[argv.indexOf("plan") + 1];

  if (!phase || phase.startsWith("--")) {
    io.stderr(
      formatResult(
        createResult({ exitCode: 1, stderr: "Missing phase number. Usage: apx phase plan <phase>" }),
        json,
      ),
    );
    return 1;
  }

  const planningRoot =
    parseOption(argv, "--planning-root") ?? path.join(io.cwd, DEFAULT_PLANNING_ROOT);
  const research = hasFlag(argv, "--research");
  const prd = parseOption(argv, "--prd") ?? null;
  const mvp = hasFlag(argv, "--mvp");

  const artifacts = [
    {
      file: `phase-${phase}/CONTEXT.md`,
      description: "Background context, constraints, and prior art",
    },
    {
      file: `phase-${phase}/RESEARCH.md`,
      description: "Research findings and technical decisions",
    },
    {
      file: `phase-${phase}/PLAN.md`,
      description: "Task breakdown, dependency waves, and acceptance criteria",
    },
  ];

  const waves = [
    { wave: 1, tasks: ["Define interfaces and contracts", "Set up test scaffolding"] },
    {
      wave: 2,
      tasks: ["Implement core logic (parallel where possible)", "Write unit tests"],
    },
    { wave: 3, tasks: ["Integration, wiring, and verification"] },
  ];

  if (json) {
    io.stdout(
      formatResult(
        createResult({
          stdout: `phase plan: phase ${phase}`,
          data: {
            phase,
            planningRoot,
            research,
            prd,
            mvp,
            artifacts: artifacts.map((a) => ({
              ...a,
              path: path.join(planningRoot, a.file),
            })),
            waves,
            nextStep: `apx phase execute ${phase} --planning-root ${planningRoot}`,
          },
        }),
        true,
      ),
    );
    return 0;
  }

  io.stdout(`Phase ${phase} — Plan\n`);
  io.stdout(`Planning root: ${planningRoot}`);
  if (research) io.stdout("Research mode: enabled (phase-researcher agent)");
  if (prd) io.stdout(`PRD: ${prd}`);
  if (mvp) io.stdout("MVP mode: enabled (minimum viable scope)");
  io.stdout("\nArtifacts to generate:");
  for (const a of artifacts) {
    io.stdout(`  ${path.join(planningRoot, a.file)}`);
    io.stdout(`    ${a.description}`);
  }
  io.stdout("\nDependency waves:");
  for (const w of waves) {
    io.stdout(`  Wave ${w.wave}:`);
    for (const t of w.tasks) io.stdout(`    - ${t}`);
  }
  io.stdout(`\nNext: apx phase execute ${phase}`);
  return 0;
}

export async function runPhaseExecuteCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const phase = argv[argv.indexOf("execute") + 1];

  if (!phase || phase.startsWith("--")) {
    io.stderr(
      formatResult(
        createResult({
          exitCode: 1,
          stderr: "Missing phase number. Usage: apx phase execute <phase>",
        }),
        json,
      ),
    );
    return 1;
  }

  const planningRoot =
    parseOption(argv, "--planning-root") ?? path.join(io.cwd, DEFAULT_PLANNING_ROOT);
  const wave = parseOption(argv, "--wave") ?? null;
  const interactive = hasFlag(argv, "--interactive");

  const planFile = path.join(planningRoot, `phase-${phase}`, "PLAN.md");

  const allSteps = [
    { step: 1, action: `Read ${planFile}`, detail: "Load task breakdown and dependency waves" },
    {
      step: 2,
      action: "Execute Wave 1 tasks",
      detail: "Foundation: interfaces, contracts, test scaffolding",
    },
    {
      step: 3,
      action: "Execute Wave 2 tasks (parallel where safe)",
      detail: "Core implementation",
    },
    { step: 4, action: "Execute Wave 3 tasks", detail: "Integration and wiring" },
    {
      step: 5,
      action: `apx phase verify ${phase}`,
      detail: "Verify against acceptance criteria",
    },
  ];

  const steps =
    wave !== null
      ? allSteps.filter((s) => s.step === 1 || s.step === parseInt(wave, 10) + 1)
      : allSteps;

  const commitBoundary = {
    when: "After each wave completes",
    suggested: `git add -A && git commit -m "feat(phase-${phase}): complete wave {N} — {description}"`,
    note: "Agent surfaces this suggestion; user controls the actual commit. No auto-commit.",
  };

  const artifactPaths = [
    path.join(planningRoot, `phase-${phase}`, "PLAN.md"),
    path.join(planningRoot, `phase-${phase}`, "CONTEXT.md"),
  ];

  if (json) {
    io.stdout(
      formatResult(
        createResult({
          stdout: `phase execute: phase ${phase}`,
          data: {
            phase,
            planningRoot,
            wave,
            interactive,
            planFile,
            steps,
            artifactPaths,
            commitBoundary,
            nextStep: `apx phase verify ${phase} --planning-root ${planningRoot}`,
          },
        }),
        true,
      ),
    );
    return 0;
  }

  io.stdout(`Phase ${phase} — Execute${wave !== null ? ` (wave ${wave})` : ""}\n`);
  io.stdout(`Plan: ${planFile}`);
  if (interactive) io.stdout("Interactive mode: on");
  io.stdout("\nExecution steps:");
  for (const s of steps) io.stdout(`  ${s.step}. ${s.action}\n     ${s.detail}`);
  io.stdout("\nCommit boundary (suggested, not automatic):");
  io.stdout(`  ${commitBoundary.suggested}`);
  io.stdout(`  Note: ${commitBoundary.note}`);
  io.stdout(`\nNext: apx phase verify ${phase}`);
  return 0;
}

export async function runPhaseVerifyCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const phase = argv[argv.indexOf("verify") + 1];

  if (!phase || phase.startsWith("--")) {
    io.stderr(
      formatResult(
        createResult({
          exitCode: 1,
          stderr: "Missing phase number. Usage: apx phase verify <phase>",
        }),
        json,
      ),
    );
    return 1;
  }

  const planningRoot =
    parseOption(argv, "--planning-root") ?? path.join(io.cwd, DEFAULT_PLANNING_ROOT);

  const verificationBlocks = [
    { block: "Tests", check: "All tests pass", command: "npm test" },
    {
      block: "Acceptance criteria",
      check: "Each criterion in PLAN.md marked done",
      command: "(manual)",
    },
    {
      block: "Security",
      check: "No new secrets or OWASP violations",
      command: "apx security-audit --path .",
    },
    { block: "Ship check", check: "Pre-PR checklist passes", command: "apx ship-check" },
    {
      block: "State update",
      check: "STATE.md updated with phase completion",
      command: "(manual)",
    },
  ];

  const nextPhase = String(parseInt(phase, 10) + 1);

  if (json) {
    io.stdout(
      formatResult(
        createResult({
          stdout: `phase verify: phase ${phase}`,
          data: {
            phase,
            planningRoot,
            verificationBlocks,
            nextStep: `Update STATE.md, then: apx phase discuss ${nextPhase} or close project`,
          },
        }),
        true,
      ),
    );
    return 0;
  }

  io.stdout(`Phase ${phase} — Verify\n`);
  io.stdout(`Planning root: ${planningRoot}\n`);
  io.stdout("Verification blocks:");
  for (const v of verificationBlocks) {
    io.stdout(`  [${v.block}] ${v.check}`);
    if (v.command !== "(manual)") io.stdout(`    Run: ${v.command}`);
  }
  io.stdout(`\nNext: update STATE.md, then apx phase discuss ${nextPhase} or close project`);
  return 0;
}

export async function runCodebaseMapCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const yes = hasFlag(argv, "--yes");
  const dest = parseOption(argv, "--dest") ?? path.join(io.cwd, DEFAULT_CODEBASE_DEST);

  const templates = [
    "STACK.md",
    "INTEGRATIONS.md",
    "ARCHITECTURE.md",
    "STRUCTURE.md",
    "CONVENTIONS.md",
    "TESTING.md",
    "CONCERNS.md",
  ];

  if (!yes) {
    if (json) {
      io.stdout(
        formatResult(
          createResult({
            stdout: `codebase map dry-run: ${dest}`,
            data: {
              dest,
              dryRun: true,
              templates,
              templatePaths: templates.map((t) => path.join(dest, t)),
              agents: ["codebase-mapper"],
              plugin: "codebase-intelligence",
            },
          }),
          true,
        ),
      );
    } else {
      io.stdout("Codebase map (dry-run):");
      io.stdout(`dest: ${dest}`);
      io.stdout("safety: no files written\n");
      for (const t of templates) io.stdout(`  would create: ${path.join(dest, t)}`);
      io.stdout("\nagent: codebase-mapper (plugins/codebase-intelligence)");
      io.stdout("\n(Run with --yes to create template stubs)");
    }
    return 0;
  }

  await fs.mkdir(dest, { recursive: true });
  const created: string[] = [];
  const skipped: string[] = [];

  for (const t of templates) {
    const filePath = path.join(dest, t);
    try {
      await fs.access(filePath);
      skipped.push(filePath);
    } catch {
      await fs.writeFile(
        filePath,
        `# ${t.replace(".md", "")}\n\n_Generated by apx codebase map — fill in with codebase-mapper agent_\n`,
        "utf8",
      );
      created.push(filePath);
    }
  }

  if (json) {
    io.stdout(
      formatResult(
        createResult({
          stdout: `codebase map: ${dest}`,
          data: { dest, dryRun: false, created, skipped, agents: ["codebase-mapper"] },
        }),
        true,
      ),
    );
  } else {
    io.stdout(`Codebase map: ${dest}`);
    io.stdout(`Created: ${created.length} stub(s)`);
    if (skipped.length > 0) io.stdout(`Skipped: ${skipped.length} (already exist)`);
    io.stdout("\nNext: use codebase-mapper agent to fill in each template");
  }
  return 0;
}

export async function runReviewCodeCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const depth = parseOption(argv, "--depth") ?? "standard";
  const filesRaw = parseOption(argv, "--files");
  const fix = hasFlag(argv, "--fix");

  const validDepths = ["quick", "standard", "deep"] as const;
  if (!(validDepths as readonly string[]).includes(depth)) {
    io.stderr(
      formatResult(
        createResult({
          exitCode: 1,
          stderr: `Invalid --depth '${depth}'. Must be one of: ${validDepths.join(", ")}`,
        }),
        json,
      ),
    );
    return 1;
  }

  type Depth = (typeof validDepths)[number];

  const depthConfig: Record<Depth, { focus: string[]; maxFiles: number }> = {
    quick: { focus: ["correctness", "obvious bugs"], maxFiles: 5 },
    standard: {
      focus: ["correctness", "design", "test coverage", "naming"],
      maxFiles: 20,
    },
    deep: {
      focus: [
        "correctness",
        "design",
        "security",
        "performance",
        "maintainability",
        "test coverage",
      ],
      maxFiles: 100,
    },
  };

  const config = depthConfig[depth as Depth];

  // File scope precedence: --files > SUMMARY.md > git diff fallback
  let fileScope: "explicit" | "summary" | "git-diff";
  let files: string[] = [];

  if (filesRaw) {
    fileScope = "explicit";
    files = filesRaw
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
  } else {
    const summaryPath = path.join(io.cwd, DEFAULT_PLANNING_ROOT, "SUMMARY.md");
    try {
      await fs.access(summaryPath);
      fileScope = "summary";
    } catch {
      fileScope = "git-diff";
    }
  }

  const fileScopeDesc =
    fileScope === "explicit"
      ? files.join(", ")
      : fileScope === "summary"
        ? path.join(DEFAULT_PLANNING_ROOT, "SUMMARY.md")
        : "git diff (staged and unstaged changes)";

  const reviewPrompt = `Perform a ${depth} code review.

File scope: ${fileScopeDesc}

Focus areas (${depth}): ${config.focus.join(", ")}

${fix ? "After identifying issues, propose specific fixes inline." : "Identify issues only — do not auto-fix."}

Review format:
1. Summary (1-2 sentences)
2. Issues found (severity: P0/P1/P2)
3. Recommendations`;

  if (json) {
    io.stdout(
      formatResult(
        createResult({
          stdout: `review code: depth=${depth} scope=${fileScope}`,
          data: {
            depth,
            fileScope,
            files: fileScope === "explicit" ? files : [],
            fix,
            focus: config.focus,
            reviewPrompt,
          },
        }),
        true,
      ),
    );
    return 0;
  }

  io.stdout(`Code Review (${depth})\n`);
  io.stdout(`File scope: ${fileScope} — ${fileScopeDesc}`);
  io.stdout(`Focus: ${config.focus.join(", ")}`);
  if (fix) io.stdout("Fix mode: enabled");
  io.stdout(`\nReview prompt:\n${reviewPrompt}`);
  io.stdout(`\nNext: apx ask-claude "<paste prompt above>" --json`);
  return 0;
}

interface RouteResult {
  request: string;
  classification: string;
  command: string;
  rationale: string;
  alternatives: string[];
}

function classifyWorkflow(request: string): RouteResult {
  const lower = request.toLowerCase();
  if (/discuss|clarif|scope|requirements/.test(lower)) {
    return {
      request,
      classification: "phase-discussion",
      command: "apx phase discuss 1",
      rationale: "Request involves discussing requirements or clarifying scope",
      alternatives: ['apx clarify-requirements "<request>"', "apx phase discuss 2"],
    };
  }
  if (/plan|design|architect|breakdown|wave/.test(lower)) {
    return {
      request,
      classification: "phase-planning",
      command: "apx phase plan 1",
      rationale: "Request involves planning or designing a phase",
      alternatives: ['apx parallel-work plan "<task>"', "apx phase plan 2"],
    };
  }
  if (/execut|implement|build|develop/.test(lower)) {
    return {
      request,
      classification: "phase-execution",
      command: "apx phase execute 1",
      rationale: "Request involves implementing or executing work",
      alternatives: ["apx phase execute 2 --wave 1", "apx phase execute 1 --interactive"],
    };
  }
  if (/verify|finish|complete|done|check/.test(lower)) {
    return {
      request,
      classification: "phase-verification",
      command: "apx phase verify 1",
      rationale: "Request involves verifying or finishing work",
      alternatives: ['apx finish-loop plan "<task>"', "apx ship-check"],
    };
  }
  if (/new project|init|start/.test(lower)) {
    return {
      request,
      classification: "project-init",
      command: "apx project init",
      rationale: "Request involves starting a new project",
      alternatives: ["apx project init --dest <path>", "apx project init --yes"],
    };
  }
  return {
    request,
    classification: "general-review",
    command: 'apx tri-review "<task>"',
    rationale: "No specific workflow pattern detected — tri-review as starting point",
    alternatives: ['apx clarify-requirements "<request>"', "apx phase discuss 1"],
  };
}

function classifyReview(request: string): RouteResult {
  const lower = request.toLowerCase();
  if (/plan|spec|requirement|design/.test(lower)) {
    return {
      request,
      classification: "plan-review",
      command: "apx phase verify 1",
      rationale: "Request involves reviewing a plan or spec",
      alternatives: ['apx tri-review "<task>"', 'apx clarify-requirements "<request>"'],
    };
  }
  if (/secur|vuln|secret|owasp/.test(lower)) {
    return {
      request,
      classification: "security-review",
      command: "apx security-audit --path .",
      rationale: "Request involves security review",
      alternatives: ["apx review code --depth deep", "apx ship-check"],
    };
  }
  return {
    request,
    classification: "code-review",
    command: "apx review code --depth standard",
    rationale: "Default to standard code review",
    alternatives: ["apx review code --depth quick", "apx review code --depth deep"],
  };
}

function classifyContext(request: string): RouteResult {
  const lower = request.toLowerCase();
  if (/map|codebase|architecture|structure/.test(lower)) {
    return {
      request,
      classification: "codebase-mapping",
      command: "apx codebase map",
      rationale: "Request involves mapping or understanding the codebase",
      alternatives: ["apx codebase map --yes", "apx codebase map --dest <path>"],
    };
  }
  if (/stack|tech|framework|language/.test(lower)) {
    return {
      request,
      classification: "stack-analysis",
      command: "apx codebase map",
      rationale: "Request involves understanding the tech stack",
      alternatives: ["apx codebase map --dest <path>", "apx list"],
    };
  }
  return {
    request,
    classification: "codebase-mapping",
    command: "apx codebase map",
    rationale: "Default to codebase mapping for context requests",
    alternatives: ["apx list", "apx info <asset-name>"],
  };
}

function emitRouteResult(result: RouteResult, json: boolean, io: CliIO): number {
  if (json) {
    io.stdout(formatResult(createResult({ stdout: result.command, data: result }), true));
    return 0;
  }
  io.stdout(`Request: ${result.request}`);
  io.stdout(`Classification: ${result.classification}`);
  io.stdout(`\nRecommended: ${result.command}`);
  io.stdout(`Rationale: ${result.rationale}`);
  io.stdout("\nAlternatives:");
  for (const a of result.alternatives) io.stdout(`  - ${a}`);
  return 0;
}

export async function runWorkflowRouteCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const request = argv[2];

  if (!request || request.startsWith("--")) {
    io.stderr(
      formatResult(
        createResult({
          exitCode: 1,
          stderr: 'Missing request. Usage: apx workflow route "<request>"',
        }),
        json,
      ),
    );
    return 1;
  }

  return emitRouteResult(classifyWorkflow(request), json, io);
}

export async function runReviewRouteCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const request = argv[2];

  if (!request || request.startsWith("--")) {
    io.stderr(
      formatResult(
        createResult({
          exitCode: 1,
          stderr: 'Missing request. Usage: apx review route "<request>"',
        }),
        json,
      ),
    );
    return 1;
  }

  return emitRouteResult(classifyReview(request), json, io);
}

export async function runContextRouteCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const request = argv[2];

  if (!request || request.startsWith("--")) {
    io.stderr(
      formatResult(
        createResult({
          exitCode: 1,
          stderr: 'Missing request. Usage: apx context route "<request>"',
        }),
        json,
      ),
    );
    return 1;
  }

  return emitRouteResult(classifyContext(request), json, io);
}
