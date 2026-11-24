import { eq } from "@twt/database"
import { subscribers } from "@twt/database/schema"
import { Context, DateTime, Effect, Layer } from "effect"
import type { DatabaseError } from "../domain/errors"
import { Database } from "./Database"

/** Newsletter subscriptions. Both operations are idempotent and never reveal whether an address exists. */
export class Subscribers extends Context.Service<
  Subscribers,
  {
    subscribe(email: string): Effect.Effect<void, DatabaseError>
    unsubscribe(token: string): Effect.Effect<void, DatabaseError>
  }
>()("@twt/core/services/Subscribers") {
  static readonly layerNoDeps = Layer.effect(
    Subscribers,
    Effect.gen(function* () {
      const database = yield* Database

      const subscribe = Effect.fn("Subscribers.subscribe")(function* (email: string) {
        const now = DateTime.toDateUtc(yield* DateTime.now)
        yield* database.query("subscribers.subscribe", (db) =>
          db
            .insert(subscribers)
            .values({ email: email.trim().toLowerCase() })
            .onConflictDoUpdate({
              target: subscribers.email,
              set: { active: true, unsubscribedAt: null, subscribedAt: now },
            }),
        )
      })

      const unsubscribe = Effect.fn("Subscribers.unsubscribe")(function* (token: string) {
        const now = DateTime.toDateUtc(yield* DateTime.now)
        yield* database.query("subscribers.unsubscribe", (db) =>
          db
            .update(subscribers)
            .set({ active: false, unsubscribedAt: now })
            .where(eq(subscribers.unsubscribeToken, token)),
        )
      })

      return Subscribers.of({ subscribe, unsubscribe })
    }),
  )

  static readonly layer = this.layerNoDeps.pipe(Layer.provide(Database.layer))
}
