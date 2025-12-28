# Database Architecture

This directory contains the database schema, migrations, and utilities for zip2ats.

## Structure

```
db/
├── schema.ts          # Drizzle ORM schema definitions
├── client.ts          # Database client configuration
├── seed.ts            # Seed data for SRI catalogs
├── migrations/        # SQL migrations (generated)
└── README.md          # This file
```

## Tables

### Core Tables

1. **organizations** - Multi-tenant clients (RUC-based)
2. **users** - Users within organizations
3. **upload_batches** - ZIP file uploads
4. **documents** - Individual processed XML documents (core table)
5. **ats_reports** - Generated ATS reports
6. **audit_logs** - Complete audit trail
7. **organization_settings** - Per-organization configuration
8. **sri_catalogs** - SRI official codes and catalogs

## Usage

### Generate Migrations

After modifying `schema.ts`:

```bash
pnpm db:generate
```

This creates SQL migration files in `db/migrations/`.

### Apply Migrations

**Local development:**

```bash
pnpm db:push  # Direct push (no migration files)
# or
pnpm db:migrate  # Apply migrations
```

**Production:**

```bash
npx wrangler d1 migrations apply zip2ats-db --env production
```

### Seed Data

To populate SRI catalogs:

```bash
pnpm db:seed
```

### Database Studio

Launch Drizzle Studio to explore data:

```bash
pnpm db:studio
```

Opens at `https://local.drizzle.studio`

## Schema Highlights

### Monetary Values

All monetary amounts are stored as **integers in centavos** to avoid floating-point precision issues:

```typescript
// ❌ BAD
total: 12.5; // Can be 12.499999999

// ✅ GOOD
total: 1250; // Always exact (in centavos)
```

Use utilities from `@/lib/db-utils`:

- `dollarsToCents()` - Convert dollars to cents
- `centsToDollars()` - Convert cents to dollars
- `formatCurrency()` - Format for display

### Indexes

Strategic indexes for performance:

- `documents`: org + fecha_emision, emisor_ruc, clave_acceso, xml_hash
- `upload_batches`: org + status + uploaded_at
- `ats_reports`: org + periodo

### Relationships

```
organizations (1) ──┬─> (N) users
                    ├─> (N) upload_batches ──> (N) documents
                    ├─> (N) documents
                    ├─> (N) ats_reports
                    └─> (1) organization_settings
```

## Working with D1

### Create Database

```bash
# Development
npx wrangler d1 create zip2ats-db

# Production
npx wrangler d1 create zip2ats-db-production
```

Copy the `database_id` to `wrangler.toml`.

### Execute Queries

```bash
# Local
npx wrangler d1 execute zip2ats-db --local --command "SELECT * FROM organizations"

# Remote
npx wrangler d1 execute zip2ats-db --command "SELECT * FROM organizations"
```

## Example Usage

```typescript
import { createDbClient } from "@/db/client";
import { organizations, documents } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

// Create client
const db = createDbClient(env.DB);

// Query organizations
const orgs = await db.select().from(organizations);

// Query with filters
const docs = await db
  .select()
  .from(documents)
  .where(
    and(
      eq(documents.organizationId, orgId),
      gte(documents.fechaEmision, "2025-01-01"),
      lte(documents.fechaEmision, "2025-01-31")
    )
  );

// Insert
await db.insert(organizations).values({
  id: generateUUID(),
  name: "Mi Empresa",
  ruc: "1234567890001",
  email: "contacto@empresa.com",
  status: "active",
  createdAt: getCurrentTimestamp(),
  updatedAt: getCurrentTimestamp(),
});
```

## References

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [SRI Ecuador](https://www.sri.gob.ec/)
