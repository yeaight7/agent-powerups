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
