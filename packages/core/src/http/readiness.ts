import { sql } from "@twt/db"
import { db } from "@twt/db/client"
import { runPersistence } from "../effect/persistence"

export async function checkDatabaseReadiness(): Promise<void> {
  await runPersistence("readiness.database", () => db.execute(sql`SELECT 1`))
}
