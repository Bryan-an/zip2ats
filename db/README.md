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

This project uses a minimal database schema:

1. **sri_catalogs** - SRI official codes and catalogs

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
pnpm db:d1:migrations:apply:prod
```

Optional (seed SRI catalogs; destructive for `sri_catalogs`):

```bash
pnpm db:seed:prod
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

### Remote Drizzle Studio (D1 HTTP)

Use a remote D1 database with Drizzle Studio:

```bash
pnpm db:studio:remote
```

To connect to the production D1 database run:

```bash
pnpm db:studio:prod
```

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

`sri_catalogs` is indexed by:

- `catalog_type`
- (`catalog_type`, `code`)

## Working with D1

### Create Database

```bash
# Development
pnpm wrangler d1 create zip2ats-db

# Production
pnpm wrangler d1 create zip2ats-db-production
```

Copy the `database_id` to `wrangler.toml`.

### Execute Queries

```bash
# Local
pnpm wrangler d1 execute zip2ats-db --local --command "SELECT * FROM sri_catalogs LIMIT 10"

# Remote
pnpm wrangler d1 execute zip2ats-db --remote --command "SELECT * FROM sri_catalogs LIMIT 10"
```

## Example Usage

```typescript
import { createDbClient } from "@/db/client";
import { sriCatalogs } from "@/db/schema";
import { and, eq } from "drizzle-orm";

// Create client
const db = createDbClient(env.DB);

// Query with filters
const rows = await db
  .select()
  .from(sriCatalogs)
  .where(
    and(eq(sriCatalogs.catalogType, "forma_pago"), eq(sriCatalogs.active, true))
  );
```

## References

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [SRI Ecuador](https://www.sri.gob.ec/)
