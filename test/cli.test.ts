import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { runCli } from "../src/cli/apx.js";
import { resolveCheckExecutable } from "../src/cli/commands/run-command.js";
import { checkRequirements } from "../src/cli/utils/requirements.js";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");

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

async function createStubCommand(dir: string, name: string, output: string): Promise<void> {
  if (process.platform === "win32") {
    await fs.writeFile(path.join(dir, `${name}.cmd`), `@echo off\r\necho ${output} %*\r\n`, "utf8");
    return;
  }

  const filePath = path.join(dir, name);
  await fs.writeFile(filePath, `#!/bin/sh\necho "${output} $*"\n`, { encoding: "utf8", mode: 0o755 });
  await fs.chmod(filePath, 0o755);
}

async function copyDir(source: string, destination: string): Promise<void> {
  await fs.cp(source, destination, { recursive: true });
}

async function executeWithPath(argv: string[], commandDir: string) {
  const pathValue = `${commandDir}${path.delimiter}${process.env.PATH ?? ""}`;
  const previousPath = process.env.PATH;

  try {
    process.env.PATH = pathValue;
    return await execute(argv);
  } finally {
    process.env.PATH = previousPath;
  }
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

test("requirements report npm packages as declared rather than missing", () => {
  const statuses = checkRequirements({ npm_packages: ["defuddle"] });

  assert.deepEqual(statuses, [
    {
      label: "npm:defuddle",
      status: "DECLARED",
      ok: true,
      installHint: "npm install -g defuddle",
    },
  ]);
});

test("check reports npm packages as declared and does not fail because of them", async () => {
  const result = await execute(["check", "defuddle"]);

  assert.equal(result.exitCode, 1);
  assert.match(result.stdout, /command:defuddle=MISSING/);
  assert.match(result.stdout, /npm:defuddle=DECLARED/);
  assert.doesNotMatch(result.stdout, /npm:defuddle=MISSING/);
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
  assert.match(result.stdout, /github\/github-mcp-server/i);
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
  assert.ok(json.data.checks.some((check: { name: string }) => check.name === "package/license consistency"));
  assert.ok(json.data.checks.some((check: { name: string }) => check.name === "plugin mirror sync"));
  assert.deepEqual(json.actions, []);
  assert.ok(Array.isArray(json.warnings));
});

test("doctor --full --json reports build test and validator checks without recursive npm test", async () => {
  const result = await execute(["doctor", "--full", "--json"]);

  assert.equal(result.exitCode, 0);
  const json = parseJson(result.stdout);
  const checkNames = json.data.checks.map((check: { name: string }) => check.name);
  assert.ok(checkNames.includes("npm run build"));
  assert.ok(checkNames.includes("npm test"));
  assert.ok(checkNames.includes("apx validate skills"));
  assert.ok(checkNames.includes("apx validate catalog"));
  assert.ok(
    json.data.checks.some(
      (check: { name: string; skipped?: boolean }) => check.name === "npm test" && check.skipped,
    ),
  );
});

test("ask claude runs local CLI and writes artifact as json", async () => {
  const commandDir = await fs.mkdtemp(path.join(os.tmpdir(), "apx-ask-bin-"));
  const artifactDir = await fs.mkdtemp(path.join(os.tmpdir(), "apx-artifacts-"));
  await createStubCommand(commandDir, "claude", "CLAUDE_STUB");

  const result = await executeWithPath([
    "ask",
    "claude",
    "Review this patch",
    "--artifact-dir",
    artifactDir,
    "--json",
  ], commandDir);

  assert.equal(result.exitCode, 0);
  const json = parseJson(result.stdout);
  assert.equal(json.exitCode, 0);
  assert.equal(json.data.provider, "claude");
  assert.equal(json.data.promptLength, "Review this patch".length);
  assert.match(json.data.artifactPath, /claude-review-this-patch-\d{8}T\d{6}\d{3}Z\.md$/);
  assert.match(json.stdout, /CLAUDE_STUB/);

  const artifact = await fs.readFile(json.data.artifactPath, "utf8");
  assert.match(artifact, /## Original user task/);
  assert.match(artifact, /## Final prompt sent to Claude CLI/);
  assert.match(artifact, /## Claude output \(raw\)/);
  assert.match(artifact, /## Concise summary/);
  assert.match(artifact, /## Action items \/ next steps/);
});

test("ask gemini runs local CLI and writes artifact", async () => {
  const commandDir = await fs.mkdtemp(path.join(os.tmpdir(), "apx-ask-bin-"));
  const artifactDir = await fs.mkdtemp(path.join(os.tmpdir(), "apx-artifacts-"));
  await createStubCommand(commandDir, "gemini", "GEMINI_STUB");

  const result = await executeWithPath([
    "ask",
    "gemini",
    "Brainstorm test cases",
    "--artifact-dir",
    artifactDir,
  ], commandDir);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /ask complete/);
  assert.match(result.stdout, /provider: gemini/);
  assert.match(result.stdout, /artifact:/);
  assert.match(result.stdout, /GEMINI_STUB/);
});

test("ask requires a prompt", async () => {
  const result = await execute(["ask", "claude"]);

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /Missing prompt/);
});

test("ask rejects unknown provider", async () => {
  const result = await execute(["ask", "llama", "hello"]);

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /Unknown ask provider/);
});

test("ask reports missing local CLI without MCP fallback", async () => {
  const previousPath = process.env.PATH;
  try {
    process.env.PATH = await fs.mkdtemp(path.join(os.tmpdir(), "apx-empty-path-"));
    const result = await execute(["ask", "claude", "hello"]);

    assert.equal(result.exitCode, 1);
    assert.match(result.stderr, /Local Claude CLI is required/);
    assert.match(result.stderr, /claude --version/);
    assert.match(result.stderr, /MCP fallback is not used/);
  } finally {
    process.env.PATH = previousPath;
  }
});

test("commands run ship-check executes safe checks as json", async () => {
  const result = await execute(["commands", "run", "ship-check", "--json"]);

  assert.equal(result.exitCode, 0);
  const json = parseJson(result.stdout);
  assert.equal(json.exitCode, 0);
  assert.match(json.stdout, /ship-check/);
  assert.ok(json.data.checks.some((check: { name: string }) => check.name === "git status --short"));
  assert.ok(json.data.checks.some((check: { name: string }) => check.name === "apx validate catalog"));
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
  assert.ok(json.data.requiredCommands.some((entry: { name: string }) => entry.name === "docker"));
  assert.match(json.data.warning, /github\/github-mcp-server/i);
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

test("plugin validate accepts built plugin output", async () => {
  const dest = await fs.mkdtemp(path.join(os.tmpdir(), "apx-plugin-validate-"));
  await execute(["plugin", "build", "--dest", dest, "--write"]);
  const result = await execute(["plugin", "validate", dest, "--json"]);

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
  await fs.access(path.join(dest, "skills", "ask-claude", "SKILL.md"));
  await fs.access(path.join(dest, "skills", "ask-gemini", "SKILL.md"));
  await fs.access(path.join(dest, "commands", "generic", "ship-check.md"));
  await fs.access(path.join(dest, "mcp", "generic", "github-local.json"));
  await fs.access(path.join(dest, "agents-md", "typescript-app", "AGENTS.md"));
});

test("plugin diff detects mirrored asset drift", async () => {
  const pluginDir = await fs.mkdtemp(path.join(os.tmpdir(), "apx-plugin-drift-"));
  await execute(["plugin", "build", "--dest", pluginDir, "--write"]);
  await fs.rm(path.join(pluginDir, "skills", "systematic-debugging", "SKILL.md"));

  const result = await execute(["plugin", "diff", pluginDir, "--json"]);

  assert.equal(result.exitCode, 1);
  const json = parseJson(result.stdout);
  assert.match(json.stdout, /plugin diff failed/);
  assert.ok(json.data.diffs.some((diff: string) => diff.includes("skills/systematic-debugging/SKILL.md")));
});

test("relay init creates context.md and reports session path", async () => {
  const result = await execute(["relay", "init", "test-session-42"]);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /test-session-42/);
  assert.match(result.stdout, /context\.md/);
  const contextPath = result.stdout.match(/context: (.+)/)?.[1]?.trim() ?? "";
  const content = await fs.readFile(contextPath, "utf8");
  assert.match(content, /# Relay: test-session-42/);
  assert.match(content, /Turn 0 context/);
});

test("relay init rejects invalid session name", async () => {
  const result = await execute(["relay", "init", "BAD NAME"]);

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /lowercase/i);
});

test("relay init rejects duplicate session", async () => {
  await execute(["relay", "init", "dupe-session"]);
  const second = await execute(["relay", "init", "dupe-session"]);

  assert.equal(second.exitCode, 1);
  assert.match(second.stderr, /already exists/i);
});

test("ship-check resolves npm through PATH on Windows instead of Node install layout", () => {
  const resolved = resolveCheckExecutable("npm", ["test"], "win32");

  assert.equal(resolved.command, "npm.cmd");
  assert.deepEqual(resolved.args, ["test"]);
});
