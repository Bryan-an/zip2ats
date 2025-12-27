# Package Manager: pnpm

**Always use `pnpm` instead of npm or yarn** to install dependencies and run scripts.

## Why pnpm?

- **Faster**: Shares packages across projects, faster installs
- **Disk efficient**: Saves disk space with content-addressable storage
- **Strict**: Prevents phantom dependencies (importing packages not in package.json)
- **Workspace support**: Better monorepo support if needed in the future
- **Compatible**: Works with all npm packages and follows npm standards

## Common Commands

```bash
# Install dependencies
pnpm install

# Add a dependency (exact version)
pnpm add -E <package>

# Add a dev dependency
pnpm add -D <package>

# Remove a package
pnpm remove <package>

# Run a script
pnpm dev
pnpm build
pnpm lint

# Update dependencies
pnpm update

# Clean install (like npm ci)
pnpm install --frozen-lockfile
```

## Lockfile

- Lockfile: `pnpm-lock.yaml` (commit this to git)
- **Never** use `npm install` or `yarn install` - it will create wrong lockfiles
- If someone runs npm/yarn by mistake, delete `package-lock.json` or `yarn.lock`

## CI/CD

In CI pipelines, always use:

```bash
pnpm install --frozen-lockfile
```

This ensures the exact versions from the lockfile are installed.
