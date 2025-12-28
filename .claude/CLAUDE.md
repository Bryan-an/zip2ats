# zip2ats Project

From SRI XML to ATS ready in minutes.

A micro-SaaS web app that processes electronic receipts XML from Ecuador's SRI, normalizes data, and generates ATS/purchase-sales books in Excel/CSV format.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Package Manager**: pnpm
- **Backend**: Cloudflare Workers + D1 (SQLite)
- **Database ORM**: Drizzle ORM
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod validation
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **AI Code Review**: CodeRabbit

## Project Structure

```
zip2ats/
├── app/              # Next.js App Router pages and layouts
├── components/       # React components (shadcn/ui + custom)
├── lib/              # Utilities, parsers, and shared logic
├── db/               # Drizzle ORM schema and migrations
├── constants/        # Application constants
├── hooks/            # Custom React hooks
└── public/           # Static assets
```

## Development Commands

### Core Development

- `pnpm dev` - Start development server (http://localhost:3000)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm type-check` - Run TypeScript type checking

### Code Quality

- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

### Database (Drizzle ORM)

- `pnpm db:generate` - Generate migrations from schema
- `pnpm db:migrate` - Run migrations
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Drizzle Studio GUI
- `pnpm db:seed` - Seed database with test data

## Git Workflow

This project follows **GitHub Flow**:

- Create feature branches from `main` (format: `<type>/<description>`)
- Use conventional commits (feat, fix, docs, etc.)
- Open PRs for review
- Keep `main` always deployable

### Committing Changes

Use built-in Claude Code commit skills:

- `/commit` - Create a conventional commit
- `/commit-push-pr` - Commit, push, and create PR

## Development Guidelines

### Language Standards

- **Code, comments, docs**: English only
- **User-facing text**: Spanish (UI labels, error messages, notifications)

### Package Management

- Always use `pnpm` (never npm or yarn)
- Production dependencies: exact versions (no ^ or ~)
- Dev dependencies: semver with ^ allowed

### Code Style

- No barrel files (index.ts re-exports) - use direct imports
- TypeScript strict mode enforced
- Follow ESLint and Prettier configurations

### Pre-commit Checks

Husky runs automatically on commit:

- ESLint on staged .ts/.tsx/.js/.jsx files
- Prettier on staged files
- Fix issues before committing

## Deployment

Target platform: **Cloudflare Pages**

- Edge compute: Cloudflare Workers
- Database: Cloudflare D1 (SQLite)

## Additional Context

See modular rules in `.claude/rules/` for specific guidelines:

- Branch naming and workflow
- Dependency versioning strategy
- Parser error code conventions
- Import patterns (no barrel files)
