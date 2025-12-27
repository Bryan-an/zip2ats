# Commit Message Guidelines

When creating commits, automatically choose the most appropriate type and descriptive message based on the changes:

## Commit Types

- **feat**: new features
- **fix**: bug fixes
- **docs**: documentation changes
- **style**: formatting, missing semicolons, etc.
- **refactor**: code restructuring without changing behavior
- **test**: adding or updating tests
- **chore**: build config, gitignore, dependencies, etc.

## Guidelines

- Always create descriptive, concise commit messages in English
- Follow conventional commit format: `<type>: <description>`
- Keep the description clear and focused on what changed and why

## Using Built-in Commit Skills

Claude Code has built-in commit skills that support conventional commits:

- `/commit` - Create a conventional commit with staged changes
- `/commit-push-pr` - Commit, push, and open a pull request

These skills automatically follow the conventional commit format.
