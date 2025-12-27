# Code and Documentation Language Standards

## Language Usage Rules

### Use English For:

- All code (variable names, function names, class names)
- Comments and inline documentation
- Documentation files (README, guides, etc.)
- Commit messages
- Pull request titles and descriptions
- API responses and logs visible to developers
- Code examples

### Use Spanish For:

- User-facing strings (UI text, buttons, labels)
- Error messages shown to end users
- Notifications displayed in the application
- Help text and tooltips for users

## Examples

### ✅ Correct

```typescript
// English code and comments
function calculateTotalAmount(invoice: Invoice): number {
  // Calculate the total including taxes
  return invoice.subtotal + invoice.taxes;
}

// Spanish user-facing text
const errorMessage = "No se pudo procesar la factura";
const buttonLabel = "Guardar cambios";
```

### ❌ Incorrect

```typescript
// Spanish code - DON'T DO THIS
function calcularMontoTotal(factura: Factura): number {
  // Calcular el total incluyendo impuestos
  return factura.subtotal + factura.impuestos;
}

// English user-facing text - DON'T DO THIS
const errorMessage = "Could not process invoice";
const buttonLabel = "Save changes";
```

## Why This Matters

- **Code consistency**: English is the standard for code worldwide
- **Team collaboration**: Makes code readable for international developers
- **User experience**: Spanish UI makes the app accessible to Ecuadorian users
- **Maintainability**: Clear separation between code and content
