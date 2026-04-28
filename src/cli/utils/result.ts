export interface ExecutionResult<TData = unknown> {
  exitCode: number;
  stdout: string;
  stderr: string;
  warnings: string[];
  actions: string[];
  data?: TData;
}

export function createResult<TData = unknown>(input: {
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  warnings?: string[];
  actions?: string[];
  data?: TData;
}): ExecutionResult<TData> {
  return {
    exitCode: input.exitCode ?? 0,
    stdout: input.stdout ?? "",
    stderr: input.stderr ?? "",
    warnings: input.warnings ?? [],
    actions: input.actions ?? [],
    ...(input.data === undefined ? {} : { data: input.data }),
  };
}

export function formatResult(result: ExecutionResult, json: boolean): string {
  if (json) {
    return JSON.stringify(result, null, 2);
  }
  return result.stdout;
}
