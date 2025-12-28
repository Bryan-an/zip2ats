---
paths: ["lib/parser/**/*.ts"]
---

# Parser Error Codes Centralization

All parser error codes MUST be defined in `lib/parser/errors.ts` inside the `PARSER_ERRORS` constant.

## Why Centralize Error Codes

- **Single source of truth**: All error codes in one place
- **Prevents typos**: No string literals scattered across files
- **Easy refactoring**: Change error code once, affects all usages
- **Better IDE support**: Autocomplete and type checking for error codes
- **Documentation**: Easy to see all possible errors

## ✅ Correct Usage

```typescript
// In lib/parser/errors.ts
export const PARSER_ERRORS = {
  MISSING_CLAVE_ACCESO: "MISSING_CLAVE_ACCESO",
  INVALID_XML_FORMAT: "INVALID_XML_FORMAT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  // ... other error codes
} as const;

// In your parser code
import { PARSER_ERRORS } from "@/lib/parser/errors";

throw new ParserError({
  code: PARSER_ERRORS.MISSING_CLAVE_ACCESO,
  message: "Invoice is missing clave de acceso",
});
```

## ❌ Wrong Usage

```typescript
// ❌ Don't use inline string literals
throw new ParserError({
  code: "MISSING_CLAVE_ACCESO", // Hard to maintain, prone to typos
  message: "Invoice is missing clave de acceso",
});
```

## Adding New Error Codes

When you need a new parser error:

1. Add the error code to `PARSER_ERRORS` in `lib/parser/errors.ts`
2. Use descriptive, SCREAMING_SNAKE_CASE names
3. Import and use the constant in your parser code

```typescript
// 1. Add to lib/parser/errors.ts
export const PARSER_ERRORS = {
  // ... existing codes
  INVALID_TAX_PERCENTAGE: "INVALID_TAX_PERCENTAGE", // New error code
} as const;

// 2. Use in your code
import { PARSER_ERRORS } from "@/lib/parser/errors";

if (tax < 0 || tax > 100) {
  throw new ParserError({
    code: PARSER_ERRORS.INVALID_TAX_PERCENTAGE,
    message: `Tax percentage must be between 0 and 100, got ${tax}`,
  });
}
```
