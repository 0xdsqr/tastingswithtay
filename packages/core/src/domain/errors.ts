import { Schema } from "effect"

/** A query or statement failed. Carries only the driver error's name, never its message. */
export class DatabaseError extends Schema.TaggedError<DatabaseError>()("DatabaseError", {
  operation: Schema.String,
  reason: Schema.String,
}) {}

/** The object store could not be reached or refused the request. */
export class StorageError extends Schema.TaggedError<StorageError>()("StorageError", {
  operation: Schema.String,
  key: Schema.String,
  reason: Schema.String,
}) {}

export class RateLimited extends Schema.TaggedError<RateLimited>()(
  "RateLimited",
  {
    message: Schema.String,
    retryAfterMs: Schema.Number,
  },
  { httpApiStatus: 429 },
) {}

export class Forbidden extends Schema.TaggedError<Forbidden>()(
  "Forbidden",
  { message: Schema.String },
  { httpApiStatus: 403 },
) {}
