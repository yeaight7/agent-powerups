---
name: api-doc-review
description: Use when API documentation may have drifted from the implementation -- endpoints changed without a spec update, integration partners report mismatches, or a PR touches routes, params, or response shapes.
---

## Purpose

Outdated API documentation causes integration failures. The code is the source of truth, and the docs must match. Review the docs against the actual route handlers and fix mismatches immediately — do not defer.

## When to Use

- A PR adds or modifies routes, request/response types, or error handling
- Consumers report behavior that contradicts the documented API
- Before publishing or versioning an OpenAPI/Swagger spec

## Inputs

- The API documentation (OpenAPI/Swagger spec, or inline route docs)
- The route handler source, types/validation schemas, and API tests

## Workflow

1. **Inventory both sides.** List documented endpoints and implemented routes, then diff the two lists:

   ```bash
   rg -n "^  /" openapi.yaml                                   # documented paths
   rg -n "router\.(get|post|put|patch|delete)\(" src/          # implemented routes
   git diff --name-only origin/main...HEAD -- "src/routes/"    # what changed recently
   ```

2. **Verify each endpoint** (e.g., POST /users) against its route definition: path, method, and auth requirements — route middleware vs the documented security scheme.

3. **Verify parameters.** All required request parameters (body, query, params) must be documented with correct types. Compare against the handler's validation schema or type definitions, not against the old doc.

4. **Verify responses.** All possible response status codes (200, 400, 404, 500) and their payloads must match the actual error handlers and return statements:

   ```bash
   rg -n "res\.status\(|throw new .*Error" src/routes/   # codes actually produced
   ```

5. **Cross-check examples against tests.** Documented request/response examples should match what the API tests actually send and assert.

6. **Fix immediately.** If there is a mismatch, update the OpenAPI spec or inline documentation now. Do not defer it.

## Output

- Per-endpoint verdict: documented vs actual (path, method, auth, params, status codes, examples)
- Spec/doc fixes applied, or a mismatch list with file:line where fixing needs owner input

## Verification

- [ ] Every changed route compared against its documented endpoint
- [ ] Parameter names, types, and required flags match the handler's validation
- [ ] Documented status codes match the codes actually returned or thrown
- [ ] Auth requirements per endpoint match the route middleware
- [ ] No mismatch deferred — fixed or explicitly escalated

## Failure Modes

- **Doc-first trust** — assuming the spec is right; the code is the source of truth.
- **Happy-path-only review** — checking 200 responses while error codes drift unchecked.
- **Silent auth drift** — an endpoint gains an auth requirement the docs never mention.
- **Deferred fixes** — "will update the spec later" is how the drift started.
