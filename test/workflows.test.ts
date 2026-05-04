import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import { runCli } from "../src/cli/apx.js";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");

async function execute(argv: string[]) {
  const stdout: string[] = [];
  const stderr: string[] = [];

  const exitCode = await runCli(argv, {
    cwd: repoRoot,
    stdout: (line: string) => stdout.push(line),
    stderr: (line: string) => stderr.push(line),
  });

  return { exitCode, stdout: stdout.join("\n"), stderr: stderr.join("\n") };
}

function parseJson(stdout: string): any {
  return JSON.parse(stdout);
}

// ── tri-review ─────────────────────────────────────────────────────────────

test("tri-review --json returns task, advisors, and synthesisChecklist", async () => {
  const result = await execute(["tri-review", "Review this PR", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.task, "Review this PR");
  assert.ok(Array.isArray(data.data.advisors));
  assert.equal(data.data.advisors.length, 3);
  assert.ok(Array.isArray(data.data.synthesisChecklist));
  assert.ok(data.data.synthesisChecklist.length > 0);
  const providers = data.data.advisors.map((a: any) => a.provider);
  assert.deepEqual(providers.sort(), ["claude", "codex", "gemini"]);
});

test("tri-review without task returns exit 1", async () => {
  const result = await execute(["tri-review"]);
  assert.equal(result.exitCode, 1);
});

test("tri-review plain output mentions advisor providers", async () => {
  const result = await execute(["tri-review", "Fix the auth bug"]);
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /CLAUDE/);
  assert.match(result.stdout, /GEMINI/);
  assert.match(result.stdout, /CODEX/);
});

// ── clarify-requirements ──────────────────────────────────────────────────

test("clarify-requirements --json returns request, dimensions, and questions", async () => {
  const result = await execute(["clarify-requirements", "Build a spec-driven installer", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.request, "Build a spec-driven installer");
  assert.ok(Array.isArray(data.data.dimensions));
  assert.ok(Array.isArray(data.data.questions));
  assert.ok(data.data.questions.length > 0);
  assert.ok(typeof data.data.nextStep === "string");
});

test("clarify-requirements without request returns exit 1", async () => {
  const result = await execute(["clarify-requirements"]);
  assert.equal(result.exitCode, 1);
});

// ── parallel-work ─────────────────────────────────────────────────────────

test("parallel-work plan --json returns task, waves, and commitBoundary", async () => {
  const result = await execute(["parallel-work", "plan", "Implement auth service", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.task, "Implement auth service");
  assert.ok(Array.isArray(data.data.waves));
  assert.ok(data.data.waves.length >= 2);
  assert.ok(typeof data.data.commitBoundary === "string");
  assert.match(data.data.commitBoundary, /not automatic/);
});

test("parallel-work without plan subcommand returns exit 1", async () => {
  const result = await execute(["parallel-work", "unknown"]);
  assert.equal(result.exitCode, 1);
});

test("parallel-work plan without task returns exit 1", async () => {
  const result = await execute(["parallel-work", "plan"]);
  assert.equal(result.exitCode, 1);
});

// ── finish-loop ───────────────────────────────────────────────────────────

test("finish-loop plan --json returns task, completionCriteria, and verificationSteps", async () => {
  const result = await execute(["finish-loop", "plan", "Ship the feature", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.task, "Ship the feature");
  assert.ok(Array.isArray(data.data.completionCriteria));
  assert.ok(Array.isArray(data.data.verificationSteps));
  assert.ok(data.data.verificationSteps.length >= 3);
  assert.ok(typeof data.data.loopBehavior === "string");
});

test("finish-loop without plan subcommand returns exit 1", async () => {
  const result = await execute(["finish-loop"]);
  assert.equal(result.exitCode, 1);
});

// ── project init ──────────────────────────────────────────────────────────

test("project init --json returns dry-run plan with artifacts", async () => {
  const result = await execute(["project", "init", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.dryRun, true);
  assert.ok(Array.isArray(data.data.artifacts));
  const files = data.data.artifacts.map((a: any) => a.file);
  assert.ok(files.includes("PROJECT.md"));
  assert.ok(files.includes("STATE.md"));
  assert.ok(files.includes("config.json"));
});

test("project unknown subcommand returns exit 1", async () => {
  const result = await execute(["project", "unknown"]);
  assert.equal(result.exitCode, 1);
});

// ── phase discuss ─────────────────────────────────────────────────────────

test("phase discuss --json returns phase, planningRoot, discussionPrompt, nextStep", async () => {
  const result = await execute(["phase", "discuss", "1", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.phase, "1");
  assert.ok(typeof data.data.planningRoot === "string");
  assert.ok(typeof data.data.discussionPrompt === "string");
  assert.match(data.data.discussionPrompt, /Phase 1/);
  assert.match(data.data.nextStep, /phase plan 1/);
});

test("phase discuss without phase number returns exit 1", async () => {
  const result = await execute(["phase", "discuss"]);
  assert.equal(result.exitCode, 1);
});

// ── phase plan ────────────────────────────────────────────────────────────

test("phase plan --json returns phase, artifacts, waves, nextStep", async () => {
  const result = await execute(["phase", "plan", "1", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.phase, "1");
  assert.ok(Array.isArray(data.data.artifacts));
  assert.ok(data.data.artifacts.some((a: any) => a.file.includes("PLAN.md")));
  assert.ok(Array.isArray(data.data.waves));
  assert.match(data.data.nextStep, /phase execute 1/);
});

test("phase plan --research flag is reflected in json output", async () => {
  const result = await execute(["phase", "plan", "2", "--research", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.research, true);
  assert.equal(data.data.phase, "2");
});

test("phase plan without phase number returns exit 1", async () => {
  const result = await execute(["phase", "plan"]);
  assert.equal(result.exitCode, 1);
});

// ── phase execute ─────────────────────────────────────────────────────────

test("phase execute --json returns steps, commitBoundary, artifactPaths, nextStep", async () => {
  const result = await execute(["phase", "execute", "1", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.phase, "1");
  assert.ok(Array.isArray(data.data.steps));
  assert.ok(data.data.steps.length >= 3);
  assert.ok(typeof data.data.commitBoundary === "object");
  assert.match(data.data.commitBoundary.note, /auto-commit|not automatic/i);
  assert.ok(Array.isArray(data.data.artifactPaths));
  assert.match(data.data.nextStep, /phase verify 1/);
});

test("phase execute --wave narrows steps in json output", async () => {
  const result = await execute(["phase", "execute", "1", "--wave", "2", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.wave, "2");
  assert.ok(Array.isArray(data.data.steps));
  // narrowed steps should be fewer than full set
  assert.ok(data.data.steps.length < 5);
});

test("phase execute without phase number returns exit 1", async () => {
  const result = await execute(["phase", "execute"]);
  assert.equal(result.exitCode, 1);
});

// ── phase verify ──────────────────────────────────────────────────────────

test("phase verify --json returns phase, verificationBlocks, nextStep", async () => {
  const result = await execute(["phase", "verify", "1", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.phase, "1");
  assert.ok(Array.isArray(data.data.verificationBlocks));
  assert.ok(data.data.verificationBlocks.length >= 3);
  assert.match(data.data.nextStep, /phase discuss 2/);
});

test("phase verify without phase number returns exit 1", async () => {
  const result = await execute(["phase", "verify"]);
  assert.equal(result.exitCode, 1);
});

// ── codebase map ──────────────────────────────────────────────────────────

test("codebase map --json returns dry-run with templates and agents", async () => {
  const result = await execute(["codebase", "map", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.dryRun, true);
  assert.ok(Array.isArray(data.data.templates));
  assert.ok(data.data.templates.includes("STACK.md"));
  assert.ok(data.data.templates.includes("ARCHITECTURE.md"));
  assert.ok(Array.isArray(data.data.agents));
  assert.ok(data.data.agents.includes("codebase-mapper"));
});

test("codebase unknown subcommand returns exit 1", async () => {
  const result = await execute(["codebase", "unknown"]);
  assert.equal(result.exitCode, 1);
});

// ── review code ───────────────────────────────────────────────────────────

test("review code --depth quick --json returns depth, fileScope, focus, reviewPrompt", async () => {
  const result = await execute(["review", "code", "--depth", "quick", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.depth, "quick");
  assert.ok(["explicit", "summary", "git-diff"].includes(data.data.fileScope));
  assert.ok(Array.isArray(data.data.focus));
  assert.ok(typeof data.data.reviewPrompt === "string");
  assert.match(data.data.reviewPrompt, /quick/);
});

test("review code --depth deep --files --json sets fileScope to explicit", async () => {
  const result = await execute([
    "review",
    "code",
    "--depth",
    "deep",
    "--files",
    "src/foo.ts,src/bar.ts",
    "--json",
  ]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.fileScope, "explicit");
  assert.deepEqual(data.data.files, ["src/foo.ts", "src/bar.ts"]);
});

test("review code --depth invalid returns exit 1", async () => {
  const result = await execute(["review", "code", "--depth", "mega"]);
  assert.equal(result.exitCode, 1);
});

test("review unknown subcommand returns exit 1", async () => {
  const result = await execute(["review", "unknown"]);
  assert.equal(result.exitCode, 1);
});

// ── workflow route ────────────────────────────────────────────────────────

test("workflow route --json classifies plan request", async () => {
  const result = await execute(["workflow", "route", "plan phase 2", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.request, "plan phase 2");
  assert.ok(typeof data.data.classification === "string");
  assert.ok(typeof data.data.command === "string");
  assert.ok(data.data.command.startsWith("apx"));
  assert.ok(Array.isArray(data.data.alternatives));
});

test("workflow route --json classifies execute request", async () => {
  const result = await execute(["workflow", "route", "implement the login feature", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.match(data.data.classification, /execution/);
  assert.match(data.data.command, /phase execute/);
});

test("workflow route without request returns exit 1", async () => {
  const result = await execute(["workflow", "route"]);
  assert.equal(result.exitCode, 1);
});

// ── review route ──────────────────────────────────────────────────────────

test("review route --json returns classification and command", async () => {
  const result = await execute(["review", "route", "code review needed", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.request, "code review needed");
  assert.match(data.data.command, /review code/);
});

test("review route security request routes to security-audit", async () => {
  const result = await execute(["review", "route", "check for secrets and vulnerabilities", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.match(data.data.command, /security-audit/);
});

test("review route without request returns exit 1", async () => {
  const result = await execute(["review", "route"]);
  assert.equal(result.exitCode, 1);
});

// ── context route ─────────────────────────────────────────────────────────

test("context route --json returns codebase-mapping for map request", async () => {
  const result = await execute(["context", "route", "map this repo", "--json"]);
  assert.equal(result.exitCode, 0);
  const data = parseJson(result.stdout);
  assert.equal(data.data.request, "map this repo");
  assert.match(data.data.classification, /codebase/);
  assert.match(data.data.command, /codebase map/);
});

test("context route without request returns exit 1", async () => {
  const result = await execute(["context", "route"]);
  assert.equal(result.exitCode, 1);
});

// ── help includes new commands ─────────────────────────────────────────────

test("help text includes tri-review and phase commands", async () => {
  const result = await execute(["help"]);
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /tri-review/);
  assert.match(result.stdout, /phase discuss/);
  assert.match(result.stdout, /codebase map/);
  assert.match(result.stdout, /workflow route/);
});
