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
with `bun run --filter @twt/database migrate`. See `packages/database/MIGRATIONS.md` before migrating an
existing database. Production schema changes must use migrations, never `drizzle-kit push`.

## Runtime manifests

`helm/twt-app` is the hardened shared workload chart for the separately deployed web and admin
applications on Indigo. The two legacy charts remain frozen while Hub-A serves production. Render
checks run through `nix flake check`; immutable release selection and deployment orchestration remain
outside this repository.
