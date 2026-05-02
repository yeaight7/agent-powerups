---
name: agent-readable-docs
description: Use when writing technical documentation that needs to be readable by both humans and AI models, converting existing docs to HADS format, validating a HADS document, or optimizing documentation for token-efficient AI consumption.
---

# Human-AI Document Standard (HADS)

---

## AI READING INSTRUCTION

This skill teaches the agent how to read, generate, and validate HADS documents.
Read all `[SPEC]` blocks before responding to any HADS-related request.
Read `[NOTE]` blocks if you need context on intent or edge cases.

---

## 1. WHAT IS HADS

**[SPEC]**
- HADS = Human-AI Document Standard
- Convention for Markdown technical documentation
- Four block types: `**[SPEC]**`, `**[NOTE]**`, `**[BUG]**`, `**[?]**`
- Every HADS document requires: H1 title, version declaration, AI manifest
- AI manifest appears before first content section, tells AI what to read/skip
- File extension: `.md` — standard Markdown, no tooling required

---

## 2. BLOCK TYPES

**[SPEC]**
```
**[SPEC]**   Authoritative fact. Terse. Bullet lists, tables, code. AI reads always.
**[NOTE]**   Human context, history, examples. AI may skip.
**[BUG]**    Verified failure + fix. Required fields: symptom, cause, fix. Always read.
**[?]**      Unverified / inferred. Lower confidence. Always flagged.
```

Block tag rules:
- Bold, on its own line: `**[SPEC]**`
- Content follows immediately (no blank line between tag and content)
- Multiple blocks of different types allowed per section
- Titled BUG blocks allowed: `**[BUG] Short description**`
- No nesting of blocks inside blocks

---

## 3. REQUIRED DOCUMENT STRUCTURE

**[SPEC]**
```markdown
# Document Title
**Version X.Y.Z** · Author · Date · [metadata]

---

## AI READING INSTRUCTION

Read `[SPEC]` and `[BUG]` blocks for authoritative facts.
Read `[NOTE]` only if additional context is needed.
`[?]` blocks are unverified — treat with lower confidence.

---

## 1. First Section

**[SPEC]**
...
```

Required elements in order:
1. H1 title
2. Version block in header
3. AI manifest section before first content section
4. Content sections (H2), subsections (H3)

---

## 4. HOW AI READS HADS

**[SPEC]**
When encountering a HADS document:
1. Find and read the AI manifest first
2. Read all `[SPEC]` blocks — these are ground truth
3. Read all `[BUG]` blocks — always, before generating any code or config
4. Read `[NOTE]` blocks only if `[SPEC]` is insufficient to answer the query
5. Treat `[?]` content as hypothesis — note uncertainty in response

Token optimization: for large documents, scan section headings first, then read only `[SPEC]` and `[BUG]` blocks in relevant sections.

---

## 5. HOW TO GENERATE HADS

**[SPEC]**
When asked to write documentation in HADS format:

1. Start with header block (title, version, metadata)
2. Add AI manifest — always include, never skip
3. Organize content into numbered H2 sections
4. For each fact: write as `[SPEC]` — terse, bullet or table or code
5. For each "why" or context: write as `[NOTE]`
6. For each known failure mode with confirmed fix: write as `[BUG]`
7. For each unverified claim: write as `[?]`
8. End with changelog section

Content rules for `[SPEC]`:
- Prefer bullet lists over prose
- Prefer tables for multi-field facts
- Prefer code blocks for syntax, formats, examples
- Maximum 2 sentences of prose — if more needed, move to `[NOTE]`

Content rules for `[BUG]`:
- Always include: symptom, cause, fix
- Optional: affected versions, workaround
- Title on same line: `**[BUG] Short description**`

**[NOTE]**
When converting existing documentation to HADS: extract facts into `[SPEC]`, move narrative and history to `[NOTE]`, surface all known issues as `[BUG]`. Do not duplicate content between block types.

---

## 6. VALIDATION RULES

**[SPEC]**
A valid HADS document must have:
- H1 title
- Version in header
- AI manifest before first content section
- All block tags bold
- `[BUG]` blocks contain at minimum symptom + fix

---

## 7. DESIGN INTENT

**[NOTE]**
HADS exists because AI models increasingly read documentation before humans do. The format optimizes for this reality without sacrificing human readability.

Key insight: the AI manifest is the core innovation. It lets the model know what to read and what to skip — without requiring it to reason about document structure. Explicit is better than implicit for model consumption.
