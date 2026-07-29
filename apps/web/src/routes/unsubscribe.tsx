import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@twt/react/components/button"
import { Card, CardContent } from "@twt/react/components/card"
import { useState } from "react"
import { z } from "zod"
import { useTRPCClient } from "../lib/trpc"
import { SiteFooter } from "../components/site-footer"
import { SiteHeader } from "../components/site-header"

const searchSchema = z.object({
  token: z.string().uuid().optional().catch(undefined),
})

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: "Unsubscribe | Tastings with Tay" }, { name: "robots", content: "noindex" }],
  }),
  component: UnsubscribePage,
})

function UnsubscribePage(): React.ReactElement {
  const { token } = Route.useSearch()
  const trpcClient = useTRPCClient()
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle")

  const unsubscribe = () => {
    if (!token || status === "working") return
    setStatus("working")
    void trpcClient.subscribers.unsubscribe
      .mutate({ token })
      .then(() => setStatus("done"))
      .catch(() => setStatus("error"))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 p-8 text-center">
            <h1 className="font-serif text-2xl font-semibold">Newsletter preferences</h1>
            {!token ? (
              <p className="text-sm text-muted-foreground">
                This unsubscribe link is missing its token. Please use the link from the bottom of a
                newsletter email.
              </p>
            ) : status === "done" ? (
              <p className="text-sm text-muted-foreground">
                You're unsubscribed. You won't receive any more newsletter emails.
              </p>
            ) : status === "error" ? (
              <p className="text-sm text-muted-foreground">
                Something went wrong. Please try again in a moment.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Click below to stop receiving the Tastings with Tay newsletter.
                </p>
                <Button onClick={unsubscribe} disabled={status === "working"}>
                  {status === "working" ? "Working..." : "Unsubscribe me"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  )
}
