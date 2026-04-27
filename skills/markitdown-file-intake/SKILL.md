---
name: markitdown-file-intake
description: Use when the user provides a MarkItDown-supported file or URL and converting it to Markdown first will make inspection easier, cheaper, or more reliable. Applies to PDF, Office documents, images, audio, HTML, CSV/JSON/XML, ZIP, EPUB, YouTube URLs, and similar formats.
---

## Purpose

Convert non-text files to Markdown before inspection. Reduces token cost and enables analysis of binary or structured file formats.

## When to Use

- The user provides a local file in a format MarkItDown supports (PDF, DOCX, XLSX, PPTX, images, audio, HTML, CSV, JSON, XML, ZIP, EPUB).
- The user provides a supported URL (YouTube video, HTML page to analyze as text).
- The source is binary or structurally complex and Markdown conversion will reduce token cost.

Do not use when:
- The user explicitly asks for raw binary inspection or metadata-only handling.
- Another tool is clearly better (e.g., OCR with pixel-level reasoning).
- The file is already clean plain text.

## Inputs

- File path or URL to convert.
- Optional: desired output path for the Markdown file.

## Workflow

1. **Convert the file** using the MarkItDown CLI or the helper script in `references/`:
   ```bash
   markitdown <path-or-url> -o output.md
   ```
   Or on Windows using the PowerShell helper (see `references/convert_with_markitdown.ps1`):
   ```powershell
   powershell -ExecutionPolicy Bypass -File "convert_with_markitdown.ps1" -Source "<path-or-url>"
   ```

2. **Check the output path** printed by the script.

3. **Inspect the Markdown** with narrow reads first (head, targeted search) before loading the full file.

4. **Note to the user** that MarkItDown was used for the conversion.

5. If conversion fails, state the failure briefly and fall back to the original file only if necessary.

## Output

Path to the generated Markdown file, followed by the inspection results drawn from that Markdown.

## Verification

- [ ] MarkItDown installed and accessible
- [ ] Conversion produced a non-empty Markdown file
- [ ] Inspection uses the converted Markdown, not the original binary

## Failure Modes

- **MarkItDown not installed** — Install via `pip install markitdown`. Confirm the executable is on PATH.
- **Audio conversion fails** — Some audio formats depend on `ffmpeg`. If audio conversion warns or fails, report it explicitly.
- **Unsupported format** — Not all formats convert cleanly. If output is empty or garbled, note this and fall back to direct inspection if possible.
- **URL not accessible** — For YouTube or web URLs, network access is required. Report failures explicitly.
