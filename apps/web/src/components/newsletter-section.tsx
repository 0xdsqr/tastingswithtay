import { getRouteApi } from "@tanstack/react-router"
import { Button } from "@twt/ui/components/button"
import { Input } from "@twt/ui/components/input"
import type React from "react"
import { useState } from "react"
import { useTRPCClient } from "../lib/trpc"
import { getNewsletterContent } from "../lib/site-content"

const rootRoute = getRouteApi("__root__")

export function NewsletterSection(): React.ReactElement {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const trpcClient = useTRPCClient()
  const { sitePublication } = rootRoute.useLoaderData()
  const content = getNewsletterContent(sitePublication)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    void trpcClient.subscribers.subscribe
      .mutate({ email })
      .then((result) => {
        setMessage(result.message)
        setEmail("")
      })
      .catch(() => {
        setMessage("Could not subscribe right now. Please wait a moment and try again.")
      })
      .finally(() => setIsSubmitting(false))
  }

  return (
    <section className="bg-primary py-20 text-primary-foreground lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest opacity-80">
            {content.eyebrow}
          </p>
          <h2 className="mb-4 font-serif text-3xl tracking-tight sm:text-4xl">{content.title}</h2>
          <p className="mb-8 text-lg opacity-80">{content.body}</p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
              className="flex-1 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-primary-foreground/50"
            />
            <Button type="submit" variant="secondary" className="shrink-0" disabled={isSubmitting}>
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>

          {message ? <p className="mt-4 text-sm opacity-80">{message}</p> : null}
          <p className="mt-4 text-xs opacity-60">{content.privacyNote}</p>
        </div>
      </div>
    </section>
  )
}
