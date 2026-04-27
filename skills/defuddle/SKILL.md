---
name: defuddle
description: Extract clean markdown content from web pages using Defuddle CLI, removing clutter and navigation to save tokens. Use instead of WebFetch when the user provides a URL to read or analyze, for online documentation, articles, blog posts, or any standard web page. Do NOT use for URLs ending in .md — those are already markdown, use WebFetch directly.
---

## Purpose

Extract clean, readable content from web pages by stripping navigation, ads, and clutter. Reduces token usage compared to fetching raw HTML.

## When to Use

- User provides a URL to a documentation page, article, or blog post.
- Reading web content where navigation and clutter would waste tokens.
- Analyzing any standard web page content.

Do not use for:
- URLs ending in `.md` — use WebFetch directly.
- APIs returning JSON — fetch directly.
- Pages that require authentication.

## Inputs

- URL to parse.

## Workflow

Install if not present:
```bash
npm install -g defuddle
```

Always use `--md` for markdown output:
```bash
defuddle parse <url> --md
```

Save to file:
```bash
defuddle parse <url> --md -o content.md
```

Extract specific metadata only:
```bash
defuddle parse <url> -p title
defuddle parse <url> -p description
defuddle parse <url> -p domain
```

## Output

| Flag | Format |
|------|--------|
| `--md` | Markdown (default choice) |
| `--json` | JSON with both HTML and markdown |
| (none) | HTML |
| `-p <name>` | Specific metadata property |

Clean markdown content from the page, with navigation and ads removed.

## Verification

- [ ] Defuddle CLI installed (`defuddle --version`)
- [ ] Output is clean (no navigation artifacts or cookie banners)
- [ ] Content is the article/documentation body, not the page chrome

## Failure Modes

- **Page blocks automated access** — Try `--json` flag to get metadata only, or fall back to WebFetch.
- **JavaScript-heavy content** — Single-page apps rendered entirely in JS may produce minimal or empty output. Note this to the user and fall back to WebFetch.
- **Auth-gated content** — Defuddle cannot access pages requiring login. Use WebFetch with appropriate credentials.
