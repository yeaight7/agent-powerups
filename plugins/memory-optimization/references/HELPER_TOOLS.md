# Helper Tools

`graphify` is the primary memory engine in this bundle. Helper tools exist to improve source quality before graph work, not to replace the graph path.

Use helpers when they remove obvious friction:
- `markitdown-file-intake`: PDFs, Office docs, and other formats that are expensive to inspect directly
- `defuddle`: web pages or articles where HTML chrome would add junk to the corpus

Skip helpers when:
- files are already clean Markdown, text, or code
- the user only needs a tiny one-off answer
- conversion would add steps without improving readability or graph quality

Checks first:
```powershell
apx check graphify
apx check markitdown-file-intake
apx check defuddle
```

Rules:
- do not auto-install tools without approval
- do not run conversion just because it exists
- prefer the narrowest useful preprocessing step
- if helper requirements are missing, fall back to direct read or report that graph prep is blocked
