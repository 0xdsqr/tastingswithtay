import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

export type DatabaseOptions = {
  readonly connectionString: string | undefined
  readonly applicationName: string
  readonly poolMax: number
  readonly idleTimeoutMillis: number
  readonly connectionTimeoutMillis: number
  readonly queryTimeoutMillis: number
  readonly statementTimeoutMillis: number
  readonly allowExitOnIdle: boolean
  readonly ssl: { readonly rejectUnauthorized: boolean } | undefined
  readonly onIdleClientError: (error: Error) => void
}

/** Opens a connection pool and binds the Drizzle schema to it. The caller owns `pool.end()`. */
export function createDatabase(options: DatabaseOptions) {
  const pool = new Pool({
    connectionString: options.connectionString,
    application_name: options.applicationName,
    max: options.poolMax,
    idleTimeoutMillis: options.idleTimeoutMillis,
    connectionTimeoutMillis: options.connectionTimeoutMillis,
    query_timeout: options.queryTimeoutMillis,
    statement_timeout: options.statementTimeoutMillis,
    allowExitOnIdle: options.allowExitOnIdle,
    ssl: options.ssl,
  })
  pool.on("error", options.onIdleClientError)

  return { pool, db: drizzle(pool, { schema }) }
}

export type DrizzleDatabase = ReturnType<typeof createDatabase>["db"]
