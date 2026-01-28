# Tastings with Tay - Development Guide

## Project Overview

A recipe/lifestyle website for Tay featuring recipes, wine tasting notes, and a curated shop.

## Tech Stack

- **Framework**: TanStack Start (React + Vinxi)
- **UI**: shadcn/ui components (`@twt/ui` package)
- **Styling**: Tailwind CSS v4
- **Database**: Bun native SQLite
- **Monorepo**: Bun workspaces
- **Formatting**: Biome via treefmt-nix
- **Dev Environment**: Nix flakes

## Code Patterns

### Functional Patterns
- Prefer `forEach`, `map`, `filter`, `reduce` over imperative loops
- Use `Object.entries`, `Object.keys`, `Object.values` for object iteration
- Favor pure functions and immutability
- Use early returns to reduce nesting

### Component Structure
- Reusable components live in `packages/ui/src/components/`
- Feature-specific components in `apps/web/src/components/`
- Keep components small and focused
- Use composition over prop drilling

### Database Patterns
- Use Bun's native SQLite (`bun:sqlite`)
- Queries in `apps/web/src/lib/db/`
- Type-safe with explicit interfaces
- Migrations via simple SQL files

### File Organization
```
apps/
  web/                    # TanStack Start app
    src/
      components/         # Feature components
      lib/
        db/              # Database queries & schema
      routes/            # TanStack Router file routes
packages/
  ui/                    # shadcn/ui components
tooling/
  typescript/            # Shared tsconfig
```

## Learnings

### 2026-01-28
- Biome CSS parser doesn't support Tailwind directives - exclude `.css` files
- Exclude `*.gen.ts` files from linting (TanStack Router generated)
- Disable a11y rules that conflict with shadcn patterns: `useSemanticElements`, `useFocusableInteractive`

## Conventions

### Commits
- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Keep commits atomic and focused
- Push after each logical feature/fix

### Naming
- Components: PascalCase
- Functions/variables: camelCase
- Files: kebab-case
- Database tables: snake_case

### TypeScript
- Explicit return types on exported functions
- Interfaces over type aliases for objects
- Avoid `any` - use `unknown` if needed
