# Tastings with Tay

Bun monorepo containing the TanStack Start public site, admin application, shared Effect core,
Drizzle/PostgreSQL schema, shared React UI, and Helm runtime manifests. Nix owns the toolchain,
formatting, checks, application builds, and container images.

## Development

```sh
nix develop                      # or `direnv allow`
bun install --frozen-lockfile
bun run dev:web                  # or dev:admin
```

## Checks

```sh
nix fmt                          # treefmt: nixfmt + oxfmt
nix flake check                  # formatting, lint, typecheck, tests, knip, app builds, Helm, workflows, secrets
bun run audit                    # advisory lookup (needs the network, so it is not a flake check)
```

`bun run check` runs the same gates from the dev shell without the Nix sandbox.

## Builds and images

```sh
nix build .#web                  # Nitro server bundle (also .#admin)
nix build .#web-image            # Linux only: streams an OCI image (also .#admin-image)
./result | docker load
```

Dependencies are fetched by a fixed-output derivation keyed on `bun.lock`. After any lockfile
change, run `./nix/update-hashes.sh` and commit `nix/packages/node-modules-hashes.json`.

## Database

Generate and review migrations with `bun run db:generate`; apply them in a controlled deployment
with `bun run --filter @twt/database migrate`. See `packages/database/MIGRATIONS.md` before migrating an
existing database. Production schema changes must use migrations, never `drizzle-kit push`.

## Runtime manifests

`helm/twt-app` is the hardened shared workload chart for the separately deployed web and admin
applications. Immutable release selection and deployment orchestration remain outside this
repository.
