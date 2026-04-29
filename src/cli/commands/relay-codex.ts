import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import type { RelayBackend } from "./relay.js";

interface AcpMessage {
  jsonrpc?: string;
  id?: number | string | null;
  method?: string;
  params?: any;
  result?: any;
  error?: { code: number; message: string; data?: unknown };
}

function spawnWindowsScript(commandPath: string, args: string[]): ChildProcessWithoutNullStreams {
  return spawn(commandPath, args, {
    env: { ...process.env, TERM: "xterm-256color", COLORTERM: "truecolor" },
    shell: true,
    windowsHide: true,
  });
}

async function resolveCommand(command: string): Promise<string | undefined> {
  const pathEntries = (process.env.PATH ?? "").split(path.delimiter).filter(Boolean);
  const extensions = process.platform === "win32" ? [".cmd", ".exe", ".bat", ""] : [""];

  for (const entry of pathEntries) {
    for (const extension of extensions) {
      const candidate = path.join(entry, `${command}${extension}`);
      try {
        const stat = await fs.stat(candidate);
        if (stat.isFile()) {
          return candidate;
        }
      } catch {
        // keep searching PATH
      }
    }
  }

  return undefined;
}

class CodexAcpClient {
  private nextId = 1;
  private buffer = "";
  private readonly pending = new Map<number | string, { resolve: (message: AcpMessage) => void; reject: (error: Error) => void }>();
  private activePrompt?: { sessionId: string; chunks: string[] };

  constructor(
    private readonly child: ChildProcessWithoutNullStreams,
    private readonly repoRoot: string,
    private readonly log: (line: string) => void,
  ) {
    child.stdout.on("data", (chunk: Buffer) => this.handleStdout(chunk.toString()));
    child.stderr.on("data", (chunk: Buffer) => this.log(chunk.toString().trimEnd()));
    child.on("exit", (code, signal) => {
      const error = new Error(`Codex ACP exited: ${signal ?? code ?? "unknown"}`);
      for (const pending of this.pending.values()) {
        pending.reject(error);
      }
      this.pending.clear();
    });
  }

  async initialize(): Promise<void> {
    await this.request("initialize", {
      protocolVersion: 1,
      clientCapabilities: {
        fs: { readTextFile: true, writeTextFile: false },
        terminal: false,
      },
      clientInfo: { name: "agent-powerups-relay", version: "0.1.0" },
    });
  }

  async newSession(model?: string): Promise<string> {
    const response = await this.request("session/new", {
      cwd: this.repoRoot,
      mcpServers: [],
    });
    const sessionId = response.result?.sessionId;
    if (!sessionId || typeof sessionId !== "string") {
      throw new Error("Codex ACP did not return a sessionId");
    }
    if (model) {
      await this.request("session/set_model", { sessionId, modelId: model });
    }
    return sessionId;
  }

  async prompt(sessionId: string, prompt: string, timeoutMs: number): Promise<{ text: string; stopReason: string }> {
    if (this.activePrompt) {
      throw new Error("Relay is already handling a prompt");
    }
    this.activePrompt = { sessionId, chunks: [] };
    try {
      const response = await this.request(
        "session/prompt",
        {
          sessionId,
          prompt: [{ type: "text", text: prompt }],
        },
        timeoutMs,
      );
      return {
        text: this.activePrompt.chunks.join(""),
        stopReason: response.result?.stopReason ?? "unknown",
      };
    } finally {
      this.activePrompt = undefined;
    }
  }

  close(): void {
    this.child.kill();
  }

  private request(method: string, params: unknown, timeoutMs = 30000): Promise<AcpMessage> {
    const id = this.nextId;
    this.nextId += 1;
    const message = { jsonrpc: "2.0", id, method, params };
    this.child.stdin.write(`${JSON.stringify(message)}\n`);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timed out waiting for Codex ACP method: ${method}`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (response) => {
          clearTimeout(timer);
          if (response.error) {
            reject(new Error(response.error.message));
            return;
          }
          resolve(response);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
    });
  }

  private handleStdout(chunk: string): void {
    this.buffer += chunk;
    let newlineIndex = this.buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = this.buffer.slice(0, newlineIndex).trim();
      this.buffer = this.buffer.slice(newlineIndex + 1);
      if (line) {
        this.handleMessage(line);
      }
      newlineIndex = this.buffer.indexOf("\n");
    }
  }

  private handleMessage(line: string): void {
    let message: AcpMessage;
    try {
      message = JSON.parse(line) as AcpMessage;
    } catch (error) {
      this.log(`Invalid ACP JSON: ${String(error)}`);
      return;
    }

    if (message.method === "session/update") {
      const update = message.params?.update;
      if (
        this.activePrompt &&
        message.params?.sessionId === this.activePrompt.sessionId &&
        update?.sessionUpdate === "agent_message_chunk" &&
        update.content?.type === "text" &&
        typeof update.content.text === "string"
      ) {
        this.activePrompt.chunks.push(update.content.text);
      }
      return;
    }

    if (message.method === "fs/read_text_file" && message.id !== undefined) {
      void this.handleReadTextFile(message);
      return;
    }

    if (message.id !== undefined && message.id !== null) {
      const pending = this.pending.get(message.id);
      if (pending) {
        this.pending.delete(message.id);
        pending.resolve(message);
      }
    }
  }

  private async handleReadTextFile(message: AcpMessage): Promise<void> {
    try {
      const requestedPath = String(message.params?.path ?? "");
      const absolutePath = path.isAbsolute(requestedPath)
        ? path.resolve(requestedPath)
        : path.resolve(this.repoRoot, requestedPath);
      const relativePath = path.relative(this.repoRoot, absolutePath);
      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        throw new Error(`Refusing to read outside relay repo: ${requestedPath}`);
      }

      let content = await fs.readFile(absolutePath, "utf8");
      if (typeof message.params?.line === "number") {
        content = content.split(/\r?\n/).slice(message.params.line).join("\n");
      }
      if (typeof message.params?.limit === "number") {
        content = content.slice(0, message.params.limit);
      }
      this.child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: message.id, result: { content } })}\n`);
    } catch (error) {
      this.child.stdin.write(
        `${JSON.stringify({
          jsonrpc: "2.0",
          id: message.id,
          error: { code: -32000, message: error instanceof Error ? error.message : String(error) },
        })}\n`,
      );
    }
  }
}

export async function buildCodexRelayBackend(
  repoRoot: string,
  model: string | undefined,
  log: (line: string) => void,
): Promise<{ backend: RelayBackend; acpSessionId: string }> {
  let commandPath = await resolveCommand("codex-acp");
  let args: string[] = [];
  
  if (!commandPath) {
    commandPath = await resolveCommand("codex");
    args = ["--experimental-acp"];
    if (!commandPath) {
      throw new Error("Local Codex CLI required.");
    }
  }

  const acpChild =
    process.platform === "win32" && /\.(?:cmd|bat)$/i.test(commandPath)
      ? spawnWindowsScript(commandPath, args)
      : spawn(commandPath, args, {
          env: { ...process.env, TERM: "xterm-256color", COLORTERM: "truecolor" },
          windowsHide: true,
        });

  const acp = new CodexAcpClient(acpChild, repoRoot, log);
  await acp.initialize();

  const acpSessionId = await acp.newSession(model);

  return {
    backend: {
      prompt: (prompt, timeoutMs) => acp.prompt(acpSessionId, prompt, timeoutMs),
      close: () => acp.close(),
    },
    acpSessionId,
  };
}