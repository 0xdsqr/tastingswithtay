import { createFileRoute } from "@tanstack/react-router"
import { MessageSquare } from "lucide-react"

export const Route = createFileRoute("/studio/comments/")({
  component: CommentsPage,
})

function CommentsPage(): React.ReactElement {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight">
          Comments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and moderate comments across your site.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
        <MessageSquare className="mb-4 size-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">
          Comment moderation coming soon
        </h3>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          A centralized view for managing all recipe and wine comments is on the
          way. You can currently moderate comments from individual recipe and
          wine pages.
        </p>
      </div>
    </div>
  )
}
