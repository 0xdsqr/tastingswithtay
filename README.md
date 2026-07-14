# Tastings with Tay

Bun monorepo containing the TanStack Start public site, admin application, shared Effect/tRPC
core, Drizzle/PostgreSQL schema, shared React UI, Nix development environment, container images,
and Helm runtime manifests.

## Development

```sh
nix develop
bun install --frozen-lockfile
bun run check
bun run typecheck:ts6
bun run audit
```

TypeScript 7 is the primary compiler. The separate TypeScript 6 gate is retained during the
migration window so package consumers can be moved deliberately.

## Database

Generate and review migrations with `bun run db:generate`; apply them in a controlled deployment
with `bun run --filter @twt/db migrate`. See `packages/db/MIGRATIONS.md` before migrating an
existing database. Production schema changes must use migrations, never `drizzle-kit push`.

## Runtime manifests

The charts in `helm/` are the application-owned runtime manifests. Render checks run through
`nix flake check`. Deployment orchestration remains outside this repository.
