# Push Checklist

Use this when the admin and public site are ready to ship.

## Local Checks

```sh
bun install
bun run lint
bun run typecheck
bun run format:check
bun audit
bun run build
```

## Required Environment

Set these in production before using admin uploads:

```sh
S3_ENDPOINT=s3.dsqr.dev
CDN_BASE=https://cdn.dsqr.dev
S3_BUCKET=tastingswithtay
S3_USE_SSL=true
S3_FORCE_PATH_STYLE=true
S3_REGION=us-east-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
AUTH_SECRET=...
```

Do not commit real secrets.

## Database

This branch adds the `site_settings` table for saved Site/About content.

```sh
bun run db:push
```

Run that against the target database before Tay starts saving About page copy in admin.

## Push

```sh
git status
git add .
git commit -m "Prepare admin content studio and RustFS images"
git push origin HEAD
```

Open a PR, wait for checks, then merge/deploy.
