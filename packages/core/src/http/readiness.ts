import { sql } from "@twt/database"
import { db } from "@twt/database/client"
import { runPersistence } from "../effect/persistence"

export async function checkDatabaseReadiness(): Promise<void> {
  await runPersistence("readiness.database", () => db.execute(sql`SELECT 1`))
}
