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

async function readJson(filePath: string): Promise<any> {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

test("plugins command: list", async () => {
  const res = await execute(["plugins", "list"]);
  assert.equal(res.exitCode, 0);
  assert.match(res.stdout, /dev-vitals/);
  assert.match(res.stdout, /quality-gates/);
});

test("plugins command: info", async () => {
  const res = await execute(["plugins", "info", "dev-vitals"]);
  assert.equal(res.exitCode, 0);
  assert.match(res.stdout, /Plugin: dev-vitals/);
  assert.match(res.stdout, /Skills/);
});

test("plugins command: info memory-optimization", async () => {
  const res = await execute(["plugins", "info", "memory-optimization"]);
  assert.equal(res.exitCode, 0);
  assert.match(res.stdout, /Plugin: memory-optimization/);
  assert.match(res.stdout, /memory-build/);
  assert.match(res.stdout, /graphify/);
});

test("plugins command: validate --all", async () => {
  const res = await execute(["plugins", "validate", "--all"]);
  assert.equal(res.exitCode, 0);
  assert.match(res.stdout, /\[PASS\] dev-vitals/);
  assert.match(res.stdout, /\[PASS\] quality-gates/);
});

test("plugins command: validate single", async () => {
  const res = await execute(["plugins", "validate", "dev-vitals"]);
  assert.equal(res.exitCode, 0);
  assert.match(res.stdout, /Plugin 'dev-vitals' is valid/);
});

test("plugins command: validate memory-optimization", async () => {
  const res = await execute(["plugins", "validate", "memory-optimization"]);
  assert.equal(res.exitCode, 0);
  assert.match(res.stdout, /Plugin 'memory-optimization' is valid/);
});

test("plugins command: install dry-run", async () => {
  const res = await execute(["plugins", "install", "dev-vitals", "--target", "generic", "--dry-run"]);
  assert.equal(res.exitCode, 0);
  assert.match(res.stdout, /Would install plugin 'dev-vitals' to/);
});

test("plugins command: install dry-run memory-optimization", async () => {
  const res = await execute(["plugins", "install", "memory-optimization", "--target", "generic", "--dry-run"]);
  assert.equal(res.exitCode, 0);
  assert.match(res.stdout, /Would install plugin 'memory-optimization' to/);
});

test("plugins command: install memory-optimization copies bundle files", async () => {
  const destPath = await tempPath("memory-optimization-install");
  const res = await execute(["plugins", "install", "memory-optimization", "--target", "generic", "--dest", destPath, "--yes"]);
  assert.equal(res.exitCode, 0);
  await fs.access(path.join(destPath, "commands", "memory-build.md"));
  await fs.access(path.join(destPath, "skills", "graphify", "SKILL.md"));
  await fs.access(path.join(destPath, "references", "GRAPHIFY_PROVENANCE.md"));
});

test("plugins command: install failure on existing dir without force", async () => {
  const destPath = await tempPath("install-dest");
  await fs.mkdir(destPath, { recursive: true });
  await fs.writeFile(path.join(destPath, "dummy.txt"), "hello");
  
  const res = await execute(["plugins", "install", "dev-vitals", "--target", "generic", "--dest", destPath, "--yes"]);
  assert.equal(res.exitCode, 1);
  assert.match(res.stderr, /is not empty. Use --force to overwrite/);
});

test("plugin marketplaces list every plugin bundle for Claude and Codex", async () => {
  const bundles = await readJson(path.join(repoRoot, "plugin-bundles.json"));
  const expectedNames = bundles.plugins.map((plugin: any) => plugin.name).sort();

  const claude = await readJson(path.join(repoRoot, ".claude-plugin", "marketplace.json"));
  const codex = await readJson(path.join(repoRoot, ".codex-plugin", "marketplace.json"));

  assert.deepEqual(claude.plugins.map((plugin: any) => plugin.name).sort(), expectedNames);
  assert.deepEqual(codex.plugins.map((plugin: any) => plugin.name).sort(), expectedNames);

  for (const bundle of bundles.plugins) {
    const pluginDir = path.join(repoRoot, "plugins", bundle.name);
    await fs.access(pluginDir);

    const claudeEntry = claude.plugins.find((plugin: any) => plugin.name === bundle.name);
    assert.ok(claudeEntry, `missing Claude marketplace entry: ${bundle.name}`);
    assert.equal(claudeEntry.source, `./plugins/${bundle.name}`);
    assert.equal(claudeEntry.description, bundle.description);
    assert.equal(claudeEntry.version, "0.1.0");
    assert.equal(claudeEntry.license, "Apache-2.0");
    assert.equal(claudeEntry.category, "Developer Tools");
    await fs.access(path.join(repoRoot, claudeEntry.source));

    const codexEntry = codex.plugins.find((plugin: any) => plugin.name === bundle.name);
    assert.ok(codexEntry, `missing Codex marketplace entry: ${bundle.name}`);
    assert.equal(codexEntry.source.source, "local");
    assert.equal(codexEntry.source.path, `./plugins/${bundle.name}`);
    assert.equal(codexEntry.policy.installation, "AVAILABLE");
    assert.equal(codexEntry.policy.authentication, "NONE");
    assert.equal(codexEntry.category, "Developer Tools");
    await fs.access(path.join(repoRoot, codexEntry.source.path));
  }
});

test("every plugin bundle has a Gemini extension manifest", async () => {
  const bundles = await readJson(path.join(repoRoot, "plugin-bundles.json"));

  for (const plugin of bundles.plugins) {
    const manifestPath = path.join(repoRoot, "plugins", plugin.name, "gemini-extension.json");
    const manifest = await readJson(manifestPath);
    assert.equal(manifest.name, plugin.name);
    assert.equal(manifest.description, plugin.description);
    assert.equal(manifest.version, "0.1.0");
    assert.equal(manifest.contextFileName, "GEMINI.md");
    await fs.access(path.join(repoRoot, "plugins", plugin.name, manifest.contextFileName));
  }
});

test("plugin bundle metadata does not ship placeholder surfaces", async () => {
  const bundles = await readJson(path.join(repoRoot, "plugin-bundles.json"));

  for (const bundle of bundles.plugins) {
    for (const key of ["skills", "agents", "commands", "templates"] as const) {
      for (const entry of bundle[key] ?? []) {
        assert.notEqual(
          entry.origin,
          "placeholder",
          `bundle ${bundle.name} still advertises placeholder ${key.slice(0, -1)} '${entry.name}'`
        );
      }
    }
  }
});
