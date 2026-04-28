#!/usr/bin/env node
import { readdir } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

async function findTests(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findTests(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".test.js")) {
      files.push(fullPath);
    }
  }
  return files;
}

const testRoot = path.resolve("dist", "test");
const testFiles = (await findTests(testRoot)).sort();

if (testFiles.length === 0) {
  console.error(`No built test files found under ${testRoot}`);
  process.exit(1);
}

const child = spawn(process.execPath, ["--test", ...testFiles], {
  stdio: "inherit",
  windowsHide: true,
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`node --test terminated by ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
