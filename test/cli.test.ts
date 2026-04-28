import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { runCli } from "../src/cli/apx.js";

const repoRoot = path.resolve(import.meta.dirname, "..");

async function execute(argv: string[]) {
  const stdout: string[] = [];
  const stderr: string[] = [];

  const exitCode = await runCli(argv, {
    cwd: repoRoot,
    stdout: (line: string) => stdout.push(line),
    stderr: (line: string) => stderr.push(line),
  });

  return {
    exitCode,
    stdout: stdout.join("\n"),
    stderr: stderr.join("\n"),
  };
}

async function tempPath(name: string): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "apx-test-"));
  return path.join(dir, name);
}

function parseJson(stdout: string): any {
  return JSON.parse(stdout);
}

test("list prints catalog assets", async () => {
  const result = await execute(["list"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /systematic-debugging/);
});

test("list --type filters assets", async () => {
  const result = await execute(["list", "--type", "script"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /check-requirements/);
  assert.doesNotMatch(result.stdout, /systematic-debugging/);
});

test("info prints asset details", async () => {
  const result = await execute(["info", "markitdown-file-intake"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /markitdown-file-intake/);
  assert.match(result.stdout, /Microsoft MarkItDown/);
});

test("check reports missing requirements without installing", async () => {
  const result = await execute(["check", "markitdown-file-intake"]);

  assert.equal(result.exitCode, 1);
  assert.match(result.stdout, /markitdown/);
  assert.match(result.stdout, /python -m pip install markitdown/);
});

test("doctor validates repo health", async () => {
  const result = await execute(["doctor"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /catalog\.json/);
  assert.match(result.stdout, /node/i);
});

test("install defaults to dry-run explanation", async () => {
  const result = await execute(["install", "systematic-debugging", "--target", "generic"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /dry-run/i);
  assert.match(result.stdout, /\.agent-powerups[\\/]installed[\\/]systematic-debugging/);
});

test("explicit dry-run reports planned copy", async () => {
  const result = await execute([
    "install",
    "systematic-debugging",
    "--target",
    "codex",
    "--dry-run",
  ]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /would copy/i);
  assert.match(result.stdout, /systematic-debugging/);
});

test("mcp list prints available configs", async () => {
  const result = await execute(["mcp", "list"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /github-local/);
});

test("mcp print prints target config with safety note", async () => {
  const result = await execute(["mcp", "print", "github-local", "--target", "claude-code"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /mcpServers/);
  assert.match(result.stdout, /GITHUB_TOKEN/);
  assert.match(result.stdout, /does not mutate/i);
});

test("agents-md list prints available templates", async () => {
  const result = await execute(["agents-md", "list"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /typescript-app/);
});

test("agents-md print prints template content", async () => {
  const result = await execute(["agents-md", "print", "typescript-app"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /AGENTS\.md/);
  assert.match(result.stdout, /TypeScript/);
});

test("commands list prints available command packs", async () => {
  const result = await execute(["commands", "list"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /ship-check/);
});

test("commands print prints target command with safety note", async () => {
  const result = await execute(["commands", "print", "ship-check", "--target", "generic"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /command: ship-check/);
  assert.match(result.stdout, /Run targeted tests/);
  assert.match(result.stdout, /does not run commands/i);
});

test("hooks list prints available hook examples", async () => {
  const result = await execute(["hooks", "list"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /no-secrets-preflight/);
});

test("hooks print prints review-before-use hook content", async () => {
  const result = await execute(["hooks", "print", "no-secrets-preflight"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /hook: no-secrets-preflight/);
  assert.match(result.stdout, /review-before-use/i);
});

test("workflows list prints available workflows", async () => {
  const result = await execute(["workflows", "list"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /feature-iteration/);
});

test("workflows print prints workflow content", async () => {
  const result = await execute(["workflows", "print", "feature-iteration"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /workflow: feature-iteration/);
  assert.match(result.stdout, /Plan/);
});

test("agents-md list includes first mocked template seeds", async () => {
  const result = await execute(["agents-md", "list"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /python-library/);
});

test("doctor --json returns execution result shape", async () => {
  const result = await execute(["doctor", "--json"]);

  assert.equal(result.exitCode, 0);
  const json = parseJson(result.stdout);
  assert.equal(json.exitCode, 0);
  assert.equal(typeof json.stdout, "string");
  assert.deepEqual(json.actions, []);
  assert.ok(Array.isArray(json.warnings));
});

test("commands run ship-check executes safe checks as json", async () => {
  const result = await execute(["commands", "run", "ship-check", "--json"]);

  assert.equal(result.exitCode, 0);
  const json = parseJson(result.stdout);
  assert.equal(json.exitCode, 0);
  assert.match(json.stdout, /ship-check/);
  assert.ok(json.data.checks.some((check: { name: string }) => check.name === "git status --short"));
  assert.ok(json.data.checks.some((check: { name: string }) => check.name === "python scripts/validate-catalog.py"));
  assert.doesNotMatch(json.stdout, /npm test/);
});

test("commands run ship-check --full includes npm test", async () => {
  const result = await execute(["commands", "run", "ship-check", "--full", "--json"]);

  assert.equal(result.exitCode, 0);
  const json = parseJson(result.stdout);
  assert.ok(json.data.checks.some((check: { name: string }) => check.name === "npm test"));
});

test("hooks run no-secrets-preflight reports redacted secret findings", async () => {
  const secretPath = await tempPath("secret.txt");
  await fs.writeFile(secretPath, "OPENAI_API_KEY=sk-test-secret-value\n", "utf8");

  const result = await execute(["hooks", "run", "no-secrets-preflight", "--path", secretPath, "--json"]);

  assert.equal(result.exitCode, 2);
  const json = parseJson(result.stdout);
  assert.equal(json.exitCode, 2);
  assert.equal(json.data.findings.length, 1);
  assert.match(json.data.findings[0].file, /secret\.txt$/);
  assert.doesNotMatch(result.stdout, /sk-test-secret-value/);
});

test("hooks run no-secrets-preflight passes clean explicit path", async () => {
  const cleanPath = await tempPath("clean.txt");
  await fs.writeFile(cleanPath, "const tokenName = 'placeholder only';\n", "utf8");

  const result = await execute(["hooks", "run", "no-secrets-preflight", "--path", cleanPath, "--json"]);

  assert.equal(result.exitCode, 0);
  const json = parseJson(result.stdout);
  assert.equal(json.data.findings.length, 0);
});

test("mcp check reports structured metadata", async () => {
  const result = await execute(["mcp", "check", "github-local", "--target", "generic", "--json"]);

  assert.equal(result.exitCode, 0);
  const json = parseJson(result.stdout);
  assert.equal(json.data.name, "github-local");
  assert.equal(json.data.target, "generic");
  assert.ok(json.data.requiredEnv.some((entry: { name: string }) => entry.name === "GITHUB_TOKEN"));
  assert.ok(json.data.requiredCommands.some((entry: { name: string }) => entry.name === "npx"));
});

test("mcp write requires explicit destination and refuses overwrite", async () => {
  const dest = await tempPath("github-local.json");
  const first = await execute(["mcp", "write", "github-local", "--target", "generic", "--dest", dest, "--json"]);

  assert.equal(first.exitCode, 0);
  assert.match(await fs.readFile(dest, "utf8"), /github-local/);

  const second = await execute(["mcp", "write", "github-local", "--target", "generic", "--dest", dest, "--json"]);
  assert.equal(second.exitCode, 1);
  assert.match(second.stderr, /Destination already exists/);
});

test("plugin validate accepts bundled plugin after metadata cleanup", async () => {
  const result = await execute(["plugin", "validate", "plugins/agent-powerups", "--json"]);

  assert.equal(result.exitCode, 0);
  const json = parseJson(result.stdout);
  assert.equal(json.data.name, "agent-powerups");
  assert.equal(json.data.placeholderCount, 0);
});

test("plugin validate rejects placeholder metadata", async () => {
  const pluginDir = await fs.mkdtemp(path.join(os.tmpdir(), "apx-plugin-"));
  await fs.mkdir(path.join(pluginDir, ".codex-plugin"), { recursive: true });
  await fs.writeFile(
    path.join(pluginDir, ".codex-plugin", "plugin.json"),
    JSON.stringify({ name: "bad", version: "0.0.1", author: { email: "YOUR_EMAIL_HERE" } }),
    "utf8",
  );

  const result = await execute(["plugin", "validate", pluginDir, "--json"]);

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /placeholder/i);
});

test("plugin build dry-run reports mirrored asset actions without writing", async () => {
  const dest = await fs.mkdtemp(path.join(os.tmpdir(), "apx-plugin-build-"));
  const result = await execute(["plugin", "build", "--dest", dest, "--dry-run", "--json"]);

  assert.equal(result.exitCode, 0);
  const json = parseJson(result.stdout);
  assert.ok(json.actions.some((action: string) => action.includes("skills/systematic-debugging")));
  await assert.rejects(fs.access(path.join(dest, "skills", "systematic-debugging", "SKILL.md")));
});

test("plugin build --write mirrors catalog-backed assets", async () => {
  const dest = await fs.mkdtemp(path.join(os.tmpdir(), "apx-plugin-build-"));
  const result = await execute(["plugin", "build", "--dest", dest, "--write", "--json"]);

  assert.equal(result.exitCode, 0);
  await fs.access(path.join(dest, ".codex-plugin", "plugin.json"));
  await fs.access(path.join(dest, "skills", "systematic-debugging", "SKILL.md"));
  await fs.access(path.join(dest, "commands", "generic", "ship-check.md"));
  await fs.access(path.join(dest, "mcp", "generic", "github-local.json"));
  await fs.access(path.join(dest, "agents-md", "typescript-app", "AGENTS.md"));
});
