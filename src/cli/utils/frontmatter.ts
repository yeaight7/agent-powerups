export interface Frontmatter {
  fields: Record<string, string | string[]>;
  body: string;
}

function parseInlineArray(value: string): string[] | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    return null;
  }
  return trimmed
    .slice(1, -1)
    .split(",")
    .map((item) => item.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

export function parseFrontmatter(content: string): Frontmatter {
  if (!content.startsWith("---")) {
    return { fields: {}, body: content };
  }

  const match = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/.exec(content);
  if (!match) {
    return { fields: {}, body: content };
  }

  const fields: Record<string, string | string[]> = {};
  const lines = match[1].split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const field = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!field) {
      continue;
    }

    const key = field[1];
    const rawValue = field[2].trim();
    if (rawValue === ">" || rawValue === "|") {
      const block: string[] = [];
      while (index + 1 < lines.length && /^\s+/.test(lines[index + 1])) {
        index += 1;
        block.push(lines[index].trim());
      }
      fields[key] = block.join(" ").trim();
      continue;
    }

    const inlineArray = parseInlineArray(rawValue);
    fields[key] = inlineArray ?? rawValue.replace(/^["']|["']$/g, "");
  }

  return {
    fields,
    body: content.slice(match[0].length),
  };
}

export function fieldAsString(fields: Record<string, string | string[]>, key: string): string | undefined {
  const value = fields[key];
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value || undefined;
}

export function fieldAsArray(fields: Record<string, string | string[]>, key: string): string[] {
  const value = fields[key];
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return value
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function extractMarkdownSection(body: string, heading: string): string | undefined {
  const lines = body.split(/\r?\n/);
  const headingRe = new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i");
  let start = -1;
  for (let index = 0; index < lines.length; index += 1) {
    if (headingRe.test(lines[index])) {
      start = index + 1;
      break;
    }
  }
  if (start === -1) {
    return undefined;
  }

  const section: string[] = [];
  for (let index = start; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) {
      break;
    }
    section.push(lines[index]);
  }
  return section.join("\n").trim() || undefined;
}
