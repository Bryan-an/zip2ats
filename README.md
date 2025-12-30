# zip2ats

From SRI XML to ATS ready in minutes.

A micro-SaaS web app that processes electronic receipts XML from Ecuador's SRI, normalizes data, and generates ATS/purchase-sales books in Excel/CSV format.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Package Manager**: pnpm
- **Backend**: Cloudflare Workers + D1 (SQLite)
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **AI Code Review**: CodeRabbit

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

### Code Quality

This project uses several tools to maintain code quality:

- **ESLint**: Linting with Next.js and TypeScript rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Run linters on staged files only
- **CodeRabbit**: AI-powered code reviews on pull requests

The pre-commit hook automatically runs linting and formatting on staged files before each commit.

### Database / Drizzle Studio

Local Drizzle Studio reads from a local SQLite file (`./db.sqlite` by default) and can be pointed at Wrangler's local D1 SQLite via `LOCAL_DB_PATH` or a symlink/copy. See [`db/README.md`](db/README.md).

### CodeRabbit Configuration

CodeRabbit is configured via `.coderabbit.yaml` to provide automated code reviews on pull requests. It's optimized for:

- Next.js 16 and React 19 best practices
- TypeScript strict mode enforcement
- Performance and accessibility checks
- Security vulnerability detection

To interact with CodeRabbit in PRs, mention `@coderabbitai` in comments.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

This application is designed to run on **Cloudflare Workers** with:

- **OpenNext adapter** (`@opennextjs/cloudflare`) for Next.js on Cloudflare
- **Cloudflare D1** for the database (SQLite)

### Build for Cloudflare

Generate the Cloudflare-compatible production bundle:

```bash
pnpm build:pages
```

This produces:

- `.open-next/worker.js` (Worker entrypoint)
- `.open-next/assets/` (static assets)

### Local preview (Wrangler)

After building:

```bash
pnpm preview:cloudflare
```

### Deploy (CLI)

Authenticate (once) and deploy:

```bash
pnpm deploy:cloudflare
```

### Deploy with Git (Cloudflare dashboard)

Use **Workers Builds** (Git integration) and set:

- **Build command**: `pnpm build:pages`
- **Deploy command**: `wrangler deploy`

Then configure your production bindings (like D1 `DB`) in the Cloudflare dashboard or via `wrangler.toml`.

### Production database (D1)

Create a production D1 database and wire it to the `DB` binding:

```bash
pnpm wrangler d1 create zip2ats-db-production
```

Copy the generated `database_id` into `wrangler.toml` (`env.production.d1_databases`), then run:

```bash
pnpm db:d1:migrations:apply:prod
pnpm db:seed:prod
```

### Custom domain + TLS

In Cloudflare Dashboard (Workers):

- Add a **Custom Domain** for the Worker (and/or a route under your zone)
- Verify DNS is in Cloudflare and the SSL/TLS certificate becomes **Active**
