import fs from "node:fs/promises";
import path from "node:path";

import { createResult, type ExecutionResult } from "../utils/result.js";

const CONTEXT_TEMPLATE = (name: string) => `\
# Relay: ${name}

Goal: <one sentence>

Scope: <files, decisions, or code in play>

Output format requested: <bullet list / patch / yes-no with explanation / etc.>

## Turn 0 context

<paste relevant code, diff, error, or plan here>
`;

export async function runRelayInitCommand(
  repoRoot: string,
  sessionName: string,
): Promise<ExecutionResult> {
  if (!sessionName || !/^[a-z0-9][a-z0-9-]*$/.test(sessionName)) {
    throw new Error(
      "Session name must start with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
    );
  }

  const sessionDir = path.join(repoRoot, ".apx", "relay", sessionName);
  const contextPath = path.join(sessionDir, "context.md");

  let alreadyExists = false;
  try {
    await fs.access(contextPath);
    alreadyExists = true;
  } catch {
    // expected — directory does not exist yet
  }

  if (alreadyExists) {
    throw new Error(`Relay session already exists: ${contextPath}`);
  }

  await fs.mkdir(sessionDir, { recursive: true });
  await fs.writeFile(contextPath, CONTEXT_TEMPLATE(sessionName), "utf8");

  return createResult({
    stdout: [
      `relay session: ${sessionName}`,
      `context: ${contextPath}`,
      "",
      "Edit context.md to describe your goal and paste Turn 0 context.",
      "Then delegate with: apx ask <provider> \"$(cat .apx/relay/${sessionName}/context.md)\" --artifact-dir .apx/relay/${sessionName}",
    ].join("\n"),
    actions: [`write ${contextPath}`],
  });
}
