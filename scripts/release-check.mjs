#!/usr/bin/env node
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const expectedVersionPattern = new RegExp(`^${escapeRegExp(packageJson.version)}\\s*$`);

const checks = [
  ["npm run build", "npm", ["run", "build"]],
  ["npm test", "npm", ["test"]],
  ["node dist/cli/apx.js doctor --full", "node", ["dist/cli/apx.js", "doctor", "--full"]],
  ["python scripts/validate-skills.py", "python", ["scripts/validate-skills.py"]],
  ["python scripts/validate-catalog.py", "python", ["scripts/validate-catalog.py"]],
  ["node dist/cli/apx.js version", "node", ["dist/cli/apx.js", "version"], { expectStdout: expectedVersionPattern }],
  ["npm pack --dry-run", "npm", ["pack", "--dry-run"]],
  ["npm publish --dry-run --access public", "npm", ["publish", "--dry-run", "--access", "public"]],
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function resolveExecutable(command) {
  if (process.platform === "win32" && command === "npm") {
    return "npm.cmd";
  }
  return command;
}

function resolveLaunch(command, args) {
  const executable = resolveExecutable(command);
  if (process.platform === "win32" && executable.endsWith(".cmd")) {
    return { command: "cmd.exe", args: ["/d", "/s", "/c", executable, ...args] };
  }
  return { command: executable, args };
}

function runCheck([label, command, args, options = {}]) {
  return new Promise((resolve) => {
    console.log(`\n> ${label}`);
    const launch = resolveLaunch(command, args);
    const child = spawn(launch.command, launch.args, {
      cwd: process.cwd(),
      env: process.env,
      shell: false,
      windowsHide: true,
    });

    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => process.stderr.write(chunk));
    child.on("close", (code) => {
      if (code !== 0) {
        resolve({ label, ok: false, detail: `exit ${code}` });
        return;
      }
      if (options.expectStdout && !options.expectStdout.test(stdout)) {
        resolve({ label, ok: false, detail: `unexpected stdout: ${stdout.trim()}` });
        return;
      }
      resolve({ label, ok: true });
    });
    child.on("error", (error) => {
      resolve({ label, ok: false, detail: error.message });
    });
  });
}

const results = [];
for (const check of checks) {
  results.push(await runCheck(check));
}

const failures = results.filter((result) => !result.ok);
if (failures.length > 0) {
  console.error("\nrelease:check failed");
  for (const failure of failures) {
    console.error(`FAIL ${failure.label}: ${failure.detail}`);
  }
  process.exit(1);
}

console.log("\nrelease:check passed");
