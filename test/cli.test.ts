import test from "node:test";
import assert from "node:assert/strict";
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
