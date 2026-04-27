---
name: markitdown-file-intake
description: Use when the user provides a MarkItDown-supported file or URL and converting it to Markdown first will make inspection easier, cheaper, or more reliable.
---

# MarkItDown File Intake

## Purpose

Convert supported files or URLs into Markdown before inspection. This reduces token cost and makes binary or structured inputs easier to analyze.

## When to Use

- User provides a local file in a format Microsoft MarkItDown supports.
- User provides a supported URL and Markdown conversion will improve inspection.
- Source is binary or structurally noisy enough that direct inspection is inefficient.

Do not use when:

- File is already clean text.
- User explicitly wants raw binary or metadata-only handling.
- Another tool is clearly better for the task.

## Requirements

Required tool:

- Microsoft MarkItDown

Check:

```powershell
Get-Command markitdown -ErrorAction SilentlyContinue
python -m markitdown --help
```

Install:

```powershell
python -m pip install markitdown
```

Rules:

- Do not assume MarkItDown is installed.
- Do not install it without user approval.
- Show the install command before running it.
- Prefer user-local or project-local installation when practical.

## Inputs

- File path or URL to convert.
- Optional output path for the generated Markdown.

## Workflow

1. Check whether MarkItDown is available.
2. If missing, tell the user before attempting conversion.
3. Convert with Microsoft MarkItDown or the helper script in `references/`.

```powershell
markitdown <path-or-url> -o output.md
```

```powershell
powershell -ExecutionPolicy Bypass -File "references\convert_with_markitdown.ps1" -Source "<path-or-url>"
```

4. Confirm output path exists and file is non-empty.
5. Inspect the generated Markdown with narrow reads first.
6. Tell the user MarkItDown was used.

## Output

- Path to the generated Markdown file
- Inspection results based on that Markdown

## Verification

- [ ] MarkItDown availability was checked first
- [ ] No conversion was claimed if the tool was missing
- [ ] Generated Markdown file exists and is non-empty
- [ ] Inspection used the generated Markdown, not the original binary

## Failure Modes

- Unsupported or weak conversion output
- Audio formats needing extra tooling such as `ffmpeg`
- Remote URL access failure
- Empty or garbled Markdown output

## Missing Dependency Behavior

If MarkItDown is missing:

1. Say conversion did not happen.
2. Tell the user Microsoft MarkItDown is required.
3. Ask before installing it.
4. Show the install command.
5. Fall back to manual inspection when practical.
