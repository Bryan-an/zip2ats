---
paths: ["package.json"]
---

# Dependency Versioning Strategy

## Rules

- **`dependencies`**: exact versions (no ^ or ~)
- **`devDependencies`**: semver with ^ allowed

## Why

- Production deps affect bundle → exact for stability
- Dev deps are tooling only → ^ for easy updates
- Lockfile (pnpm-lock.yaml) guarantees reproducibility either way

## Example

```json
{
  "dependencies": {
    "next": "16.0.1",
    "react": "19.2.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "eslint": "^9"
  }
}
```

## Installation

Install with exact version: `pnpm add -E <package>`
