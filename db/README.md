# Database Architecture

This directory contains the database schema, migrations, and utilities for zip2ats.

## Structure

```
db/
├── schema.ts          # Drizzle ORM schema definitions
├── client.ts          # Database client configuration
├── migrations/        # SQL migrations (generated)
├── seeds/             # SQL seed files (Wrangler D1 execute)
└── README.md          # This file
```

## Tables

### Core Tables

1. **users** - Application users
2. **upload_batches** - ZIP file uploads (scoped by user)
3. **documents** - Individual processed XML documents (core table)
4. **ats_reports** - Generated ATS reports (scoped by user)
5. **audit_logs** - Complete audit trail
6. **user_settings** - Per-user configuration
7. **sri_catalogs** - SRI official codes and catalogs

## Usage

### Generate Migrations

After modifying `schema.ts`:

```bash
pnpm db:generate
```

This creates SQL migration files in `db/migrations/`.

### Apply Migrations

**Recommended workflow (Cloudflare D1):**

```bash
# 1) Generate SQL migrations from db/schema.ts
pnpm db:generate

# 2) Apply migrations to your local D1 database
pnpm db:d1:migrations:apply:local

# 3) Apply migrations to your remote (dev) D1 database
pnpm db:d1:migrations:apply:remote
```

**Production:**

```bash
npx wrangler d1 migrations apply zip2ats-db-production --env production
```

### Seed Data

To populate SRI catalogs in **local Cloudflare D1**:

```bash
pnpm db:seed:local
```

This runs (1) local D1 migrations and then (2) executes the SQL seed file via Wrangler:

- `wrangler d1 migrations apply zip2ats-db --local`
- `wrangler d1 execute zip2ats-db --local --file db/seeds/sri_catalogs.seed.sql`

Why this approach: the Drizzle client in this repo uses `drizzle-orm/d1` and expects a Workers/Pages D1 binding (`env.DB`). That binding is not available when running a Node script directly (e.g., via `tsx`).

To populate SRI catalogs in **remote Cloudflare D1**:

```bash
pnpm db:seed:remote
```

This runs:

- `wrangler d1 migrations apply zip2ats-db --remote`
- `wrangler d1 execute zip2ats-db --remote --file db/seeds/sri_catalogs.seed.sql`

Important: this seed is **destructive** (`DELETE FROM sri_catalogs;`).

### Database Studio

Launch Drizzle Studio to explore data:

```bash
pnpm db:studio:local
```

Opens at `https://local.drizzle.studio`

### Local Drizzle Studio (SQLite file)

`pnpm db:studio:local` uses [`drizzle.local.config.ts`](../drizzle.local.config.ts) and expects a local SQLite file path.

- By default, it uses `./db.sqlite` (repo root)
- You can override the path via `LOCAL_DB_PATH`

To inspect the **local Wrangler D1** database with Drizzle Studio:

1. Ensure Wrangler has created the local database file (any local D1 command will do), e.g.:

```bash
pnpm db:d1:migrations:apply:local
```

2. Locate Wrangler's SQLite file (path varies per machine), typically under:

- `.wrangler/state/v3/d1/.../*.sqlite`

3. Point Drizzle Studio at it using one of these options:

- Symlink (recommended):

```bash
ln -sf "<wrangler_sqlite_path>" ./db.sqlite
```

- Copy (one-time snapshot):

```bash
cp "<wrangler_sqlite_path>" ./db.sqlite
```

- Env override:

```bash
LOCAL_DB_PATH="<wrangler_sqlite_path>" pnpm db:studio:local
```

For the remote D1 database (HTTP driver), use:

```bash
pnpm db:studio:remote
```

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

- `documents`: batch_id, fecha_emision, emisor_ruc, clave_acceso, xml_hash
- `upload_batches`: user + status + uploaded_at
- `ats_reports`: user + periodo

### Relationships

```
users (1) ──┬─> (N) upload_batches ──> (N) documents
           ├─> (N) ats_reports
           ├─> (N) audit_logs
           └─> (1) user_settings
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
npx wrangler d1 execute zip2ats-db --local --command "SELECT * FROM users"

# Remote
npx wrangler d1 execute zip2ats-db --remote --command "SELECT * FROM users"
```

## Example Usage

```typescript
import { createDbClient } from "@/db/client";
import { documents } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

// Create client
const db = createDbClient(env.DB);

// Query with filters
const docs = await db
  .select()
  .from(documents)
  .where(
    and(
      eq(documents.batchId, batchId),
      gte(documents.fechaEmision, "2025-01-01"),
      lte(documents.fechaEmision, "2025-01-31")
    )
  );
```

## References

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [SRI Ecuador](https://www.sri.gob.ec/)
