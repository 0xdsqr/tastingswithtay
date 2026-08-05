import { createFileRoute } from "@tanstack/react-router"
import { isManagedAssetFolder } from "@twt/core/images/policy"
import { limitRequestBody } from "@twt/core/http/request-body"
import { getAdminUserFromHeaders } from "../../lib/admin-access-server"
import {
  UnsupportedImageError,
  maxUploadBytes,
  processAndStoreImage,
} from "../../lib/image-processing"

// Multipart body: file bytes + ~1KB of form overhead.
const maxRequestBytes = maxUploadBytes + 64 * 1024

export const Route = createFileRoute("/api/images/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const actor = await getAdminUserFromHeaders(request.headers)
        if (!actor) {
          return Response.json({ error: "Unauthorized." }, { status: 401 })
        }

        const limited = await limitRequestBody(request, maxRequestBytes)
        if (limited instanceof Response) return limited

        let form: FormData
        try {
          form = await limited.formData()
        } catch {
          return Response.json({ error: "Send the image as multipart form data." }, { status: 400 })
        }

        const file = form.get("file")
        const folder = form.get("folder")

        if (!(file instanceof File) || typeof folder !== "string") {
          return Response.json(
            { error: "Provide a file and a destination folder." },
            { status: 400 },
          )
        }
        if (!isManagedAssetFolder(folder)) {
          return Response.json({ error: "Unknown image folder." }, { status: 400 })
        }

        try {
          const asset = await processAndStoreImage({
            actor,
            folder,
            fileName: file.name || "image",
            contentType: file.type || "application/octet-stream",
            bytes: new Uint8Array(await file.arrayBuffer()),
          })

          return Response.json({ asset })
        } catch (error) {
          if (error instanceof UnsupportedImageError) {
            return Response.json({ error: error.message }, { status: 422 })
          }
          console.error("[admin-assets] RustFS upload failed", {
            folder,
            fileName: file.name,
            contentType: file.type,
            errorCode: error instanceof Error ? error.name : "UnknownError",
            error: error instanceof Error ? error.message : "Unknown storage error",
          })
          return Response.json(
            { error: "The image could not be uploaded. Check the file and try again." },
            { status: 500 },
          )
        }
      },
    },
  },
})
