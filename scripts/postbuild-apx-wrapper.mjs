import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const outputDir = path.resolve(repoRoot, "dist", "cli");
const outputPath = path.resolve(outputDir, "apx.js");

const content = `#!/usr/bin/env node
import "../src/cli/apx.js";
`;

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(outputPath, content, "utf8");
