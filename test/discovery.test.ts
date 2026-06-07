import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
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

async function makeInstalledSkill(agentRoot: string, name: string): Promise<void> {
  const skillDir = path.join(agentRoot, "skills", name);
  await fs.mkdir(skillDir, { recursive: true });
  await fs.writeFile(
    path.join(skillDir, "SKILL.md"),
    [
      "---",
      `name: ${name}`,
      "description: Use when testing installed-only discovery.",
      "---",
      "",
      "# Installed Test Skill",
      "",
      "## When to Use",
      "",
      "Use when a local installed-only skill should be discovered.",
      "",
    ].join("\n"),
    "utf8",
  );
}

test("inventory merges catalog assets with installed-only native skills", async () => {
  const agentRoot = await fs.mkdtemp(path.join(os.tmpdir(), "apx-inventory-"));
  await makeInstalledSkill(agentRoot, "local-installed-only");

  const result = await execute(["inventory", "--target", "codex", "--agent-root", agentRoot, "--json"]);
  assert.equal(result.exitCode, 0);

  const data = parseJson(result.stdout).data;
  assert.ok(data.assets.some((asset: any) => asset.name === "systematic-debugging" && asset.sources.includes("catalog")));

  const local = data.assets.find((asset: any) => asset.name === "local-installed-only");
  assert.ok(local);
  assert.equal(local.installedOnly, true);
  assert.equal(local.installed, true);
  assert.ok(local.installedPaths.some((item: string) => item.includes(agentRoot)));
});

test("discover ranks debugging skills for bug and failing-test tasks", async () => {
  const result = await execute(["discover", "fix a failing test regression in auth", "--target", "generic", "--json"]);
  assert.equal(result.exitCode, 0);

  const data = parseJson(result.stdout).data;
  assert.equal(data.primary[0].asset.name, "systematic-debugging");
  assert.ok(data.primary.some((candidate: any) => candidate.asset.name === "bug-hunt"));
});

test("discover ranks TDD for test-first implementation", async () => {
  const result = await execute(["discover", "implement new behavior test first with TDD", "--target", "generic", "--json"]);
  assert.equal(result.exitCode, 0);

  const data = parseJson(result.stdout).data;
  assert.equal(data.primary[0].asset.name, "test-driven-development");
});

test("discover puts dependency-backed file intake under approval_required", async () => {
  const result = await execute(["discover", "convert this pdf and docx file into markdown context", "--target", "generic", "--json"]);
  assert.equal(result.exitCode, 0);

  const data = parseJson(result.stdout).data;
  assert.ok(data.approval_required.some((candidate: any) => candidate.asset.name === "markitdown-file-intake"));
  const markitdown = data.approval_required.find((candidate: any) => candidate.asset.name === "markitdown-file-intake");
  assert.match(markitdown.next_action, /apx check markitdown-file-intake only if/i);
});

test("discover finds review workflows and agents for review tasks", async () => {
  const result = await execute(["discover", "review this pull request for risky code changes", "--target", "generic", "--json"]);
  assert.equal(result.exitCode, 0);

  const data = parseJson(result.stdout).data;
  const names = [...data.primary, ...data.supporting].map((candidate: any) => candidate.asset.name);
  assert.ok(names.includes("risk-based-review") || names.includes("code-reviewer"));
});

test("discover reports no_match for unrelated requests", async () => {
  const result = await execute(["discover", "compose a birthday poem about sunshine", "--target", "generic", "--json"]);
  assert.equal(result.exitCode, 0);

  const data = parseJson(result.stdout).data;
  assert.equal(data.no_match, true);
});

test("plugins info --json exposes contained asset metadata", async () => {
  const result = await execute(["plugins", "info", "quality-gates", "--json"]);
  assert.equal(result.exitCode, 0);

  const data = parseJson(result.stdout).data;
  const tdd = data.assets.skills.find((asset: any) => asset.name === "test-driven-development");
  assert.ok(tdd);
  assert.match(tdd.summary, /implementing any feature or bugfix/i);
  assert.equal(tdd.path, "skills/test-driven-development");
});

test("native install writes a discovery index beside native skills and plugins", async () => {
  const agentRoot = await fs.mkdtemp(path.join(os.tmpdir(), "apx-install-index-"));
  const result = await execute(["install", "codex", "--agent-root", agentRoot, "--json"]);
  assert.equal(result.exitCode, 0);

  const indexPath = path.join(agentRoot, "discovery-index.json");
  const index = JSON.parse(await fs.readFile(indexPath, "utf8"));
  assert.equal(index.generated_by, "agent-powerups");
  assert.equal(index.target, "codex");
  assert.ok(index.assets.some((asset: any) => asset.name === "using-powerups"));
});

// SX-09 discovery routing regression table. These fixtures pin the metadata-driven
// scorer's behavior (D-12): positive routing per category, the planning-first and
// auth-substring guardrails (mustNotRankPrimary), surface-invisible self-routing via
// per-asset signals, and no-match. Routing strength lives in catalog.json metadata,
// so a routing regression should be fixed by editing an asset's signals — not the
// scorer. Re-derive with scripts against `apx discover` if signals change.
interface FixtureExpect {
  primaryTop?: string;
  primaryIncludes?: string[];
  supportingIncludes?: string[];
  approvalIncludes?: string[];
  mustNotRankPrimary?: string[];
  noMatch?: boolean;
}

const DISCOVERY_FIXTURES: Array<{ id: string; task: string; expect: FixtureExpect }> = [
  { id: "debug-001", task: "fix a failing test regression in auth", expect: { primaryTop: "systematic-debugging", primaryIncludes: ["systematic-debugging","bug-hunt"], mustNotRankPrimary: ["risk-based-review","agent-config-security-audit","mcp-risk-review","secret-leak-preflight"] } },
  { id: "debug-002", task: "there is a crash in the payment service, reproduce and isolate the root cause", expect: { primaryIncludes: ["systematic-debugging","bug-hunt"] } },
  { id: "debug-003", task: "diagnose a flaky test that passes locally but fails in CI intermittently", expect: { primaryIncludes: ["flaky-test-investigation"] } },
  { id: "debug-004", task: "the build is broken with type errors, fix it with the smallest diff", expect: { primaryIncludes: ["systematic-debugging","build-fix-minimal-diff"] } },
  { id: "tdd-001", task: "implement new behavior test first with TDD", expect: { primaryTop: "test-driven-development" } },
  { id: "tdd-002", task: "use red green refactor discipline to add the new export endpoint", expect: { primaryIncludes: ["test-driven-development"] } },
  { id: "tdd-003", task: "write a failing test first before implementing the new subscription logic", expect: { primaryIncludes: ["test-driven-development"] } },
  { id: "review-001", task: "review this pull request for risky code changes", expect: { primaryIncludes: ["risk-based-review","requesting-code-review"] } },
  { id: "review-002", task: "do a thorough code review of this diff and check for correctness bugs", expect: { primaryIncludes: ["risk-based-review"] } },
  { id: "review-003", task: "check the blast radius of these changes before merging", expect: { primaryIncludes: ["change-impact-check"] } },
  { id: "file-intake-001", task: "convert this pdf and docx file into markdown context", expect: { approvalIncludes: ["markitdown-file-intake"] } },
  { id: "file-intake-002", task: "extract content from a pptx slide deck and a spreadsheet into markdown", expect: { approvalIncludes: ["markitdown-file-intake"] } },
  { id: "file-intake-003", task: "extract clean markdown from this web page url", expect: { approvalIncludes: ["defuddle"] } },
  { id: "docs-001", task: "harden the project README with exact setup and test commands", expect: { primaryIncludes: ["readme-hardening"] } },
  { id: "docs-002", task: "write an architecture decision record for the new caching strategy", expect: { primaryIncludes: ["architecture-decision-records"] } },
  { id: "docs-003", task: "audit the documentation for broken file paths and outdated commands", expect: { primaryIncludes: ["doc-consistency-check"] } },
  { id: "docs-004", task: "generate a changelog from recent commits for the release notes", expect: { primaryIncludes: ["changelog-generator"] } },
  { id: "security-001", task: "audit the codebase for leaked secrets and hardcoded credentials", expect: { primaryIncludes: ["secret-leak-preflight","agent-config-security-audit"], mustNotRankPrimary: ["dbt-preflight","dbt-strategy","sql-business-logic-review","semantic-layer-change-review","metric-impact-analyzer","data-quality"] } },
  { id: "security-002", task: "scan staged git changes for exposed API keys and tokens before pushing", expect: { primaryIncludes: ["secret-leak-preflight"], mustNotRankPrimary: ["dbt-preflight","dbt-strategy","data-quality"] } },
  { id: "security-003", task: "audit the agent configuration files for vulnerabilities and permission misconfigurations", expect: { primaryIncludes: ["agent-config-security-audit"] } },
  { id: "mcp-001", task: "set up a postgres MCP server for my agent", expect: { approvalIncludes: ["postgres-readonly"] } },
  { id: "mcp-002", task: "review this MCP server configuration before enabling it in my agent", expect: { primaryIncludes: ["mcp-risk-review"] } },
  { id: "mcp-003", task: "set up browser automation with playwright MCP for my agent", expect: { primaryIncludes: ["browser-automation-safety"], approvalIncludes: ["playwright"] } },
  { id: "data-001", task: "audit dbt incremental models for the right strategy", expect: { primaryIncludes: ["dbt-incremental-strategy-audit","dbt-preflight"] } },
  { id: "data-002", task: "review this SQL model for business logic correctness and aggregation risk", expect: { primaryIncludes: ["sql-business-logic-review"] } },
  { id: "data-003", task: "check bigquery costs for hotspot detection and partition optimization", expect: { primaryIncludes: ["bigquery-cost-audit"] } },
  { id: "data-004", task: "validate dbt semantic model changes before merging to avoid BI breakage", expect: { primaryIncludes: ["semantic-layer-change-review"] } },
  { id: "cleanup-001", task: "refactor this module and remove dead code", expect: { primaryIncludes: ["dead-code-removal","safe-refactor"] } },
  { id: "cleanup-002", task: "remove unused dependencies from the package manifest", expect: { primaryIncludes: ["dependency-cleanup"] } },
  { id: "cleanup-003", task: "rename inconsistent variables and files to follow the project naming conventions", expect: { primaryIncludes: ["naming-and-structure-cleanup"] } },
  { id: "cleanup-004", task: "collapse over-engineered abstractions and remove unnecessary layers", expect: { primaryIncludes: ["architecture-simplification"] } },
  { id: "migration-001", task: "migrate the codebase from the old HTTP client to the new one in safe batches", expect: { primaryIncludes: ["incremental-migration","codebase-migration-batches"] } },
  { id: "migration-002", task: "upgrade the authentication library across the entire codebase without breaking tests", expect: { primaryIncludes: ["incremental-migration"], mustNotRankPrimary: ["secret-leak-preflight","agent-config-security-audit","mcp-risk-review"] } },
  { id: "planning-001", task: "plan and design the architecture for a new authentication feature", expect: { primaryIncludes: ["writing-plans"], mustNotRankPrimary: ["secret-leak-preflight","agent-config-security-audit","mcp-risk-review","risk-based-review","safe-refactor","dead-code-removal","dependency-cleanup","naming-and-structure-cleanup","architecture-simplification"] } },
  { id: "planning-002", task: "write an implementation plan for adding pagination to the API", expect: { primaryIncludes: ["writing-plans"] } },
  { id: "planning-003", task: "design a multi-step implementation plan for the new notification system", expect: { primaryIncludes: ["writing-plans"], mustNotRankPrimary: ["safe-refactor","dead-code-removal","dependency-cleanup","naming-and-structure-cleanup","architecture-simplification"] } },
  { id: "planning-004", task: "simplify the overall architecture and plan a conceptual redesign", expect: { primaryIncludes: ["writing-plans"], mustNotRankPrimary: ["safe-refactor","dead-code-removal","dependency-cleanup","naming-and-structure-cleanup"] } },
  { id: "planning-005", task: "brainstorm and design a new dashboard component", expect: { primaryIncludes: ["brainstorming"], mustNotRankPrimary: ["safe-refactor","dead-code-removal","dependency-cleanup","naming-and-structure-cleanup","architecture-simplification"] } },
  { id: "planning-006", task: "brainstorm approaches for the onboarding flow redesign before any implementation", expect: { primaryIncludes: ["brainstorming"], mustNotRankPrimary: ["secret-leak-preflight","agent-config-security-audit","mcp-risk-review","safe-refactor","dead-code-removal","dependency-cleanup"] } },
  { id: "invisible-001", task: "brainstorm ideas for the new reporting feature", expect: { primaryIncludes: ["brainstorming"] } },
  { id: "invisible-002", task: "clarify requirements before we start implementing the new billing module", expect: { primaryIncludes: ["requirements-clarifier"] } },
  { id: "invisible-003", task: "interview me about the new feature so we can nail down the requirements", expect: { primaryIncludes: ["requirements-clarifier"] } },
  { id: "invisible-004", task: "migrate APIs and patterns incrementally across the large codebase", expect: { primaryIncludes: ["incremental-migration","codebase-migration-batches"] } },
  { id: "no-false-auth-trigger-001", task: "plan and design the architecture for a new authentication feature", expect: { primaryIncludes: ["writing-plans"], mustNotRankPrimary: ["secret-leak-preflight","agent-config-security-audit","mcp-risk-review","risk-based-review"] } },
  { id: "no-false-auth-trigger-002", task: "upgrade the authentication library across the entire codebase", expect: { primaryIncludes: ["incremental-migration"], mustNotRankPrimary: ["secret-leak-preflight","agent-config-security-audit","mcp-risk-review"] } },
  { id: "no-false-auth-trigger-003", task: "fix the failing authentication integration test", expect: { primaryTop: "systematic-debugging", primaryIncludes: ["systematic-debugging","bug-hunt"], mustNotRankPrimary: ["secret-leak-preflight","agent-config-security-audit","mcp-risk-review","risk-based-review"] } },
  { id: "no-match-001", task: "compose a birthday poem about sunshine", expect: { noMatch: true } },
  { id: "no-match-002", task: "translate this paragraph into French", expect: { noMatch: true } },
  { id: "no-match-003", task: "what is the capital of France", expect: { noMatch: true } },
  { id: "cleanup-vs-planning-001", task: "refactor and simplify the legacy authentication module", expect: { primaryIncludes: ["safe-refactor","architecture-simplification"], mustNotRankPrimary: ["secret-leak-preflight","agent-config-security-audit","mcp-risk-review"] } },
  { id: "concise-001", task: "give me a concise brief summary with no fluff", expect: { primaryIncludes: ["no-fluff"] } },
  { id: "concise-002", task: "compress the response, fewer tokens please", expect: { primaryIncludes: ["no-fluff","context-minimization"] } },
  { id: "release-001", task: "check release readiness before tagging and publishing the new version", expect: { primaryIncludes: ["pre-release-verification","release-readiness-protocol"] } },
];

test("discover routing fixtures (SX-09 regression table)", async () => {
  const failures: string[] = [];
  for (const fixture of DISCOVERY_FIXTURES) {
    const result = await execute(["discover", fixture.task, "--target", "generic", "--json"]);
    assert.equal(result.exitCode, 0, `discover exited non-zero for ${fixture.id}`);
    const data = parseJson(result.stdout).data;
    const primary: string[] = data.primary.map((candidate: any) => candidate.asset.name);
    const supporting: string[] = data.supporting.map((candidate: any) => candidate.asset.name);
    const approval: string[] = data.approval_required.map((candidate: any) => candidate.asset.name);
    const expected = fixture.expect;
    const problems: string[] = [];
    if (expected.noMatch && !data.no_match) problems.push("expected no_match");
    if (expected.primaryTop && primary[0] !== expected.primaryTop) problems.push(`primaryTop=${primary[0]} != ${expected.primaryTop}`);
    for (const name of expected.primaryIncludes ?? []) if (!primary.includes(name)) problems.push(`primary missing ${name}`);
    for (const name of expected.supportingIncludes ?? []) if (!supporting.includes(name) && !primary.includes(name)) problems.push(`supporting missing ${name}`);
    for (const name of expected.approvalIncludes ?? []) if (!approval.includes(name)) problems.push(`approval missing ${name}`);
    for (const name of expected.mustNotRankPrimary ?? []) if (primary.includes(name)) problems.push(`primary must NOT include ${name}`);
    if (problems.length > 0) failures.push(`[${fixture.id}] "${fixture.task}" -> ${problems.join("; ")} | primary=[${primary.slice(0, 5).join(", ")}]`);
  }
  assert.deepEqual(failures, [], `\n${failures.join("\n")}`);
});
