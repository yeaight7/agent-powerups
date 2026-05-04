# Local RAG MCP Tool Model

**DRAFT: requires review before catalog/plugin activation.**

## Tools
| Tool | Use |
| --- | --- |
| `status` | Check DB size, chunks, documents, config, embedding backend. |
| `list_files` | Inventory corpus before ingest/query decisions. |
| `ingest_file` | Add/update approved PDF, DOCX, TXT, MD file by absolute path. |
| `ingest_data` | Add approved string, HTML, or Markdown with source metadata. |
| `query_documents` | Search with exact terms plus semantic context. |
| `read_chunk_neighbors` | Expand a hit before/after when context is incomplete. |
| `delete_file` | Remove stale or wrongly ingested file/source. |

## Query Pattern
1. Start with exact identifiers from user request.
2. Add domain context, not synonyms only.
3. Use `limit=5` for precision, `10` for broad exploration.
4. Read neighbors for definitions, conclusions, examples, or partial snippets.
5. Cite file/source and chunk context in synthesis.

## Ingestion Gate
Do not ingest by default. First answer:
- Is corpus already present?
- Is content approved for storage?
- Are embeddings local or remote?
- Are secrets, `.env`, private keys, logs, or auth files excluded?
- Is re-ingestion needed or will query suffice?

## Failure Modes
| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| High-scoring irrelevant hits | query too broad | add exact file/name/domain terms |
| Missing adjacent rationale | chunk boundary split | use neighbors |
| Stale answer | outdated corpus | status/list then re-ingest scoped source |
| Privacy risk | broad ingest | narrow approved files and exclude sensitive dirs |
