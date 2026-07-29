# Database migrations

Run `bun run --filter @twt/database migrate` during a controlled deployment before starting new application replicas.

`0000_baseline` is the canonical schema for a new database. An existing database that predates the migration journal must be baselined in the Drizzle journal before `0001_hardening_existing` is applied. Do not run the baseline SQL over an existing schema: capture a backup, verify the live schema, mark `0000_baseline` as already applied, and then run the compatibility migration. The compatibility constraints use `NOT VALID` so legacy rows can be cleaned and validated separately without weakening enforcement for new writes.

Never use `drizzle-kit push` against production. Generate and review a migration for every schema change, take a backup, and rehearse it against a production-like copy first.
