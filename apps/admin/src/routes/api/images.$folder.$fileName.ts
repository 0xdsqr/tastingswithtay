import { createFileRoute } from "@tanstack/react-router"
import { getManagedImage } from "../../lib/admin-assets"

export const Route = createFileRoute("/api/images/$folder/$fileName")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const result = await getManagedImage(params.folder, params.fileName)

        if (!result) {
          return new Response("Not found", { status: 404 })
        }

        return new Response(result.body, {
          headers: {
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Type": result.contentType,
          },
        })
      },
    },
  },
})
