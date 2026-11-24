import { createFileRoute } from "@tanstack/react-router"
import { limitRequestBody } from "@twt/core/http/request-body"
import { isManagedAssetFolder } from "@twt/core/images/policy"
import { Effect } from "effect"
import { AdminAccess, CurrentAdmin } from "../../server/AdminAccess"
import { AdminAssets, maxUploadBytes } from "../../server/AdminAssets"
import { runtime } from "../../server/runtime"

// Multipart body: file bytes plus form overhead.
const maxRequestBytes = maxUploadBytes + 64 * 1024

const json = (status: number, body: unknown) => Response.json(body, { status })

const upload = Effect.fn("http.imageUpload")(
  function* (request: Request) {
    // Authorize before reading the body, so anonymous callers cannot make us buffer 10 MB.
    const access = yield* AdminAccess
    const admin = yield* access.authorizeMutation(request.headers)

    const limited = yield* Effect.promise(() => limitRequestBody(request, maxRequestBytes))
    if (limited instanceof Response) return limited

    const form = yield* Effect.tryPromise(() => limited.formData()).pipe(
      Effect.catch(() => Effect.succeed(null)),
    )
    if (!form) return json(400, { error: "Send the image as multipart form data." })

    const file = form.get("file")
    const folder = form.get("folder")
    if (!(file instanceof File) || typeof folder !== "string") {
      return json(400, { error: "Provide a file and a destination folder." })
    }
    if (!isManagedAssetFolder(folder)) return json(400, { error: "Unknown image folder." })

    const bytes = new Uint8Array(yield* Effect.promise(() => file.arrayBuffer()))
    const assets = yield* AdminAssets
    const asset = yield* assets
      .upload({
        folder,
        fileName: file.name || "image",
        contentType: file.type || "application/octet-stream",
        bytes,
      })
      .pipe(Effect.provideService(CurrentAdmin, admin))

    return json(200, { asset })
  },
  Effect.catchTags({
    Unauthorized: () => Effect.succeed(json(401, { error: "Unauthorized." })),
    AdminError: (error) => Effect.succeed(json(422, { error: error.message })),
  }),
  Effect.catch((error) =>
    Effect.as(
      Effect.logError("Image upload failed", error),
      json(500, { error: "The image could not be uploaded. Check the file and try again." }),
    ),
  ),
)

export const Route = createFileRoute("/api/images/upload")({
  server: { handlers: { POST: ({ request }) => runtime.runPromise(upload(request)) } },
})
