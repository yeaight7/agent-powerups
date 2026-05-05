# Filesystem MCP Path Boundary Checklist

## Config Requirements
- Explicit allowed roots.
- No home, drive root, `/`, or broad parent dirs by default.
- Read/write methods separated.
- Dangerous methods disabled unless user explicitly approves.
- Symlink and path traversal behavior tested.

## Operation Policy
| Operation | Default |
| --- | --- |
| read/list/stat | allowed inside root |
| write/create | ask unless task explicitly requires |
| delete/move | ask with exact path and backup context |
| recursive delete | block unless user confirms exact target |
| chmod/chown | block by default |
| shell execution | not filesystem MCP responsibility |

## Validation Cases
- `../outside` denied.
- symlink to outside root denied or resolved safely.
- absolute path outside root denied.
- Windows drive path outside root denied.
- recursive operation cannot escape root.

## Report
```text
Allowed roots:
Enabled methods:
Disabled methods:
Traversal behavior:
Symlink behavior:
Deletion policy:
```
