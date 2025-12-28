# GitHub Flow Branching Strategy

Follow GitHub Flow methodology for all development work.

## Branch Naming

Format: `<type>/<description>`

### Branch Types

- **feature/** - new features
- **fix/** - bug fixes
- **chore/** - maintenance, dependencies, setup
- **docs/** - documentation
- **refactor/** - code restructuring
- **test/** - tests
- **perf/** - performance improvements

### Naming Rules

- lowercase only
- use hyphens for spaces
- descriptive but concise
- branch from `main`, merge to `main`

### Examples

- `feature/table-pagination`
- `fix/login-validation`
- `chore/update-dependencies`
- `docs/api-endpoints`

## Workflow

1. **Create branch** from `main`
2. **Commit often** using conventional commits (feat, fix, etc.)
3. **Push and open PR** when ready for review
4. **Review, test, merge** with team approval
5. **Delete branch** after merge
6. **Deploy from main**

## Main Branch

**Keep `main` always deployable.**

- All tests must pass
- Code must be reviewed
- No direct commits to `main`
