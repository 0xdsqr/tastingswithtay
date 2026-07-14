import { Data, Effect } from "effect"

export class PersistenceError extends Data.TaggedError("PersistenceError")<{
  readonly operation: string
  readonly message: string
}> {}

function safeCauseName(cause: unknown): string {
  return cause instanceof Error && cause.name ? cause.name : "Unknown persistence error"
}

export function tryPersistence<A>(
  operation: string,
  run: () => Promise<A>,
): Effect.Effect<A, PersistenceError> {
  return Effect.tryPromise({
    try: run,
    catch: (cause) =>
      new PersistenceError({
        operation,
        message: safeCauseName(cause),
      }),
  }).pipe(Effect.withSpan(`persistence.${operation}`))
}

export function runPersistence<A>(operation: string, run: () => Promise<A>): Promise<A> {
  return Effect.runPromise(tryPersistence(operation, run))
}
