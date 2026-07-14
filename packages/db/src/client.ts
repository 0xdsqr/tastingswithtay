import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

function positiveInteger(name: string, fallback: number): number {
  const raw = process.env[name]?.trim()
  if (!raw) return fallback

  const value = Number(raw)
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`)
  }

  return value
}

const connectionString = process.env.DATABASE_URL?.trim()
if (process.env.NODE_ENV === "production" && !connectionString) {
  throw new Error("DATABASE_URL must be set before starting in production.")
}

const pool = new Pool({
  connectionString: connectionString || undefined,
  application_name: process.env.DATABASE_APPLICATION_NAME?.trim() || "tastingswithtay",
  max: positiveInteger("DATABASE_POOL_MAX", 10),
  idleTimeoutMillis: positiveInteger("DATABASE_IDLE_TIMEOUT_MS", 30_000),
  connectionTimeoutMillis: positiveInteger("DATABASE_CONNECTION_TIMEOUT_MS", 5_000),
  query_timeout: positiveInteger("DATABASE_QUERY_TIMEOUT_MS", 15_000),
  statement_timeout: positiveInteger("DATABASE_STATEMENT_TIMEOUT_MS", 15_000),
  allowExitOnIdle: process.env.NODE_ENV !== "production",
  ssl:
    process.env.DATABASE_SSL === "require"
      ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false" }
      : undefined,
})

pool.on("error", (error) => {
  console.error("[database] Unexpected idle client error", {
    name: error.name,
    message: error.message,
  })
})

export const db = drizzle(pool, { schema })

export async function closeDatabase(): Promise<void> {
  await pool.end()
}
