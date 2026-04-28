import fs from "node:fs/promises";
import path from "node:path";

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function copyAsset(sourcePath: string, destinationPath: string): Promise<void> {
  if (await pathExists(destinationPath)) {
    throw new Error(`Destination already exists: ${destinationPath}`);
  }

  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  const stat = await fs.stat(sourcePath);
  if (stat.isDirectory()) {
    await fs.cp(sourcePath, destinationPath, { recursive: true });
    return;
  }

  await fs.copyFile(sourcePath, destinationPath);
}
