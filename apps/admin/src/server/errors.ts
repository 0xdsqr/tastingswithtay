import { Schema } from "effect"

/** A problem the administrator can fix. `message` is shown in the UI as-is. */
export class AdminError extends Schema.TaggedError<AdminError>()("AdminError", {
  message: Schema.String,
}) {}

/** The request is not from a signed-in, unbanned administrator on a trusted origin. */
export class Unauthorized extends Schema.TaggedError<Unauthorized>()("Unauthorized", {}) {}
