import { getRouteApi } from "@tanstack/react-router"
import type React from "react"
import { getNewsletterContent } from "../lib/site-content"
import { NewsletterSignupForm } from "./newsletter-signup-form"

const rootRoute = getRouteApi("__root__")

export function NewsletterSection(): React.ReactElement {
  const { sitePublication } = rootRoute.useLoaderData()
  const content = getNewsletterContent(sitePublication)

  return (
    <section className="bg-primary py-20 text-primary-foreground lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest opacity-80">
            {content.eyebrow}
          </p>
          <h2 className="mb-4 font-serif text-3xl tracking-tight sm:text-4xl">{content.title}</h2>
          <p className="mb-8 text-lg opacity-80">{content.body}</p>

          <NewsletterSignupForm appearance="section" />
          <p className="mt-4 text-xs opacity-60">{content.privacyNote}</p>
        </div>
      </div>
    </section>
  )
}
