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

test("plugins command: install dry-run", async () => {
  const res = await execute(["plugins", "install", "dev-vitals", "--target", "generic", "--dry-run"]);
  assert.equal(res.exitCode, 0);
  assert.match(res.stdout, /Would install plugin 'dev-vitals' to/);
});

test("plugins command: install failure on existing dir without force", async () => {
  const destPath = await tempPath("install-dest");
  await fs.mkdir(destPath, { recursive: true });
  await fs.writeFile(path.join(destPath, "dummy.txt"), "hello");
  
  const res = await execute(["plugins", "install", "dev-vitals", "--target", "generic", "--dest", destPath, "--yes"]);
  assert.equal(res.exitCode, 1);
  assert.match(res.stderr, /is not empty. Use --force to overwrite/);
});
