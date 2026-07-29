import { createFileRoute } from "@tanstack/react-router"
import { getManagedImage, getManagedImageMetadata } from "@twt/core/storage/s3"

export const Route = createFileRoute("/api/images/$folder/$fileName")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const result = await getManagedImage(params.folder, params.fileName)

        if (!result) {
          return new Response("Not found", { status: 404 })
        }

        const headers = new Headers({
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Type": result.contentType,
          "X-Content-Type-Options": "nosniff",
        })
        if (result.etag) headers.set("ETag", result.etag)
        if (result.lastModified) headers.set("Last-Modified", result.lastModified.toUTCString())
        if (result.contentLength !== undefined) {
          headers.set("Content-Length", String(result.contentLength))
        }

        if (result.etag && request.headers.get("if-none-match") === result.etag) {
          await result.body.cancel()
          return new Response(null, { status: 304, headers })
        }

        return new Response(result.body, { headers })
      },
      HEAD: async ({ params }) => {
        const result = await getManagedImageMetadata(params.folder, params.fileName)
        if (!result) return new Response(null, { status: 404 })

        const headers = new Headers({
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Type": result.contentType,
          "X-Content-Type-Options": "nosniff",
        })
        if (result.etag) headers.set("ETag", result.etag)
        if (result.lastModified) headers.set("Last-Modified", result.lastModified.toUTCString())
        if (result.contentLength !== undefined)
          headers.set("Content-Length", String(result.contentLength))
        return new Response(null, { headers })
      },
    },
  },
})
