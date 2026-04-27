---
name: defuddle
description: Use when the user provides a URL to a standard web page and clean Markdown extraction with Defuddle would reduce clutter and token cost.
---

# Defuddle

## Purpose

Extract readable Markdown from ordinary web pages by stripping navigation, ads, and page chrome.

## When to Use

- User provides a documentation page, article, or blog post URL.
- Clean Markdown extraction is preferable to noisy HTML.
- Web page clutter would waste context.

Do not use when:

- URL already points to Markdown.
- Response is an API payload.
- Page requires authentication the tool cannot satisfy.

## Requirements

Required tool:

- Defuddle CLI

Check:

```powershell
Get-Command defuddle -ErrorAction SilentlyContinue
defuddle --version
```

Install:

```powershell
npm install -g defuddle
```

Rules:

- Do not assume Defuddle is installed.
- Do not auto-install without user approval.
- Show the install command before running it.

## Inputs

- URL to parse

## Workflow

1. Check whether Defuddle CLI is available.
2. If missing, tell the user before attempting extraction.
3. Prefer Markdown output:

```powershell
defuddle parse <url> --md
```

4. Save to a file when needed:

```powershell
defuddle parse <url> --md -o content.md
```

5. For metadata-only needs, query a specific property:

```powershell
defuddle parse <url> -p title
defuddle parse <url> -p description
defuddle parse <url> -p domain
```

## Output

- Clean Markdown content
- Optional metadata fields

## Verification

- [ ] Defuddle availability was checked first
- [ ] No extraction was claimed if the tool was missing
- [ ] Output is the article or documentation body, not page chrome

## Failure Modes

- Page blocks automated access
- JavaScript-heavy page renders poorly
- Auth-gated content is inaccessible

## Missing Dependency Behavior

If Defuddle is missing:

1. Say extraction did not happen.
2. Tell the user Defuddle CLI is required.
3. Ask before installing it.
4. Show the install command.
5. Fall back to another web-reading method.
