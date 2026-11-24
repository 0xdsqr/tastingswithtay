# Tastings with Tay

Bun monorepo: `apps/web` (public site) and `apps/admin` (TanStack Start), `packages/core`
(Effect services and the HTTP API), `packages/database` (Drizzle schema), `packages/react` (UI).

## Commands

Run everything from the Nix dev shell (`nix develop`, or direnv).

- `nix fmt` — format (treefmt: nixfmt + oxfmt)
- `bun run check` — format check, lint, typecheck, tests, knip, audit, app builds
- `nix flake check` — the same gates in the sandbox, plus Helm, workflow, and secret checks
- `./nix/update-hashes.sh` — required after any `bun.lock` change

## Conventions

- Server logic lives in Effect services (`Context.Service` with a static `layer`). Framework
  routes and server functions stay thin and run effects through the app's `ManagedRuntime`
  (`apps/*/src/server/runtime.ts`).
- Read environment variables only through `packages/core/src/config.ts`, never `process.env`.
- Validate untrusted input with `Schema`. Share API contracts via `packages/core/src/api/Api.ts`,
  which browser code imports — it must never import server modules.
- Errors are `Schema.TaggedError`s. Only `AdminError` messages may reach an administrator's
  browser; database and storage failures are logged and replaced with a generic message.
- Schema changes go through `bun run db:generate` and a reviewed migration.

# Learning more about Effect

This repository uses the Effect Typescript library.

Before writing any Effect code, first read `node_modules/effect/AGENTS.md`
**completely**, and follow the links in the file when required.

If you need to learn more about particular Effect apis and concepts that the
guide doesn't cover, search through the source code in `node_modules/effect/src`.
