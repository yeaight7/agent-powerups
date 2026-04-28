export function formatList(items: string[]): string {
  return items.join("\n");
}

export function formatKeyValue(data: Array<[string, string]>): string {
  return data.map(([key, value]) => `${key}: ${value}`).join("\n");
}
