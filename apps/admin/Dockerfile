# syntax=docker/dockerfile:1.7

FROM node:24.18.0-slim@sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5 AS base
WORKDIR /app

COPY --from=oven/bun:1.3.13@sha256:87416c977a612a204eb54ab9f3927023c2a3c971f4f345a01da08ea6262ae30e /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx \
  && apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/react/package.json packages/react/package.json
COPY tooling/typescript/package.json tooling/typescript/package.json

RUN bun install --frozen-lockfile --ignore-scripts

FROM deps AS build
WORKDIR /app

COPY . .

RUN bun run --filter '@twt/database' build
RUN bun run --filter '@twt/core' build
RUN bun run --filter 'admin' build
RUN node -e "import('./apps/admin/.output/server/node_modules/sharp/dist/index.mjs').then(async ({ default: sharp }) => { await sharp({ create: { width: 1, height: 1, channels: 3, background: 'white' } }).webp().toBuffer() })"

FROM node:24.18.0-slim@sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5 AS runner
WORKDIR /app/apps/admin

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV NITRO_HOST=0.0.0.0
ENV PORT=3011

COPY docker/runtime/package.json docker/runtime/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY --chown=node:node docker/runtime/instrumentation.mjs docker/runtime/loader.mjs ./

COPY --from=build --chown=node:node /app/apps/admin/.output ./.output

EXPOSE 3011

USER node

CMD ["node", "--import", "./loader.mjs", "--import", "./instrumentation.mjs", ".output/server/index.mjs"]
