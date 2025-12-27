---
paths: ["**/*.ts", "**/*.tsx"]
---

# No Barrel Files

Use direct imports instead of barrel files (index.ts that re-export).

## Why Avoid Barrel Files

- **Better tree-shaking**: Bundlers can eliminate unused code more effectively
- **Faster dev server**: Next.js dev server starts and reloads faster
- **Smaller bundles**: Cloudflare Workers has strict size limits
- **Avoids circular dependencies**: Barrel files often create import cycles
- **Clearer dependencies**: Explicit imports show exact source of code

## ✅ Do This (Direct Imports)

```typescript
import { parseFactura } from "@/lib/parser/factura";
import { validateXML } from "@/lib/parser/validators";
import { formatCurrency } from "@/lib/utils/format";
```

## ❌ Don't Do This (Barrel Files)

```typescript
// ❌ lib/parser/index.ts - barrel file
export * from "./factura";
export * from "./validators";

// ❌ importing from barrel
import { parseFactura, validateXML } from "@/lib/parser";
```

## When You Might Think You Need a Barrel

If you find yourself wanting to create a barrel file, consider:

1. Are these exports really related? Maybe they shouldn't be grouped.
2. Can you use named exports from specific files instead?
3. Is the import path really that long to justify a barrel?

## Exception: UI Component Libraries

If you're building a standalone component library for external use (not this project), barrels might be acceptable for the public API. But for internal project code, always use direct imports.
