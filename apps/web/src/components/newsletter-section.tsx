import { Button } from "@twt/ui/components/button"
import { Input } from "@twt/ui/components/input"
import type React from "react"
import { useState } from "react"

export function NewsletterSection(): React.ReactElement {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter signup
    console.log("Newsletter signup:", email)
    setEmail("")
  }

  return (
    <section className="bg-primary py-20 text-primary-foreground lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest opacity-80">
            Stay Connected
          </p>
          <h2 className="mb-4 font-serif text-3xl tracking-tight sm:text-4xl">
            Join the Table
          </h2>
          <p className="mb-8 text-lg opacity-80">
            Get weekly recipes, cooking tips, and first access to new products
            delivered straight to your inbox.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-primary-foreground/50"
            />
            <Button type="submit" variant="secondary" className="shrink-0">
              Subscribe
            </Button>
          </form>

          <p className="mt-4 text-xs opacity-60">
            No spam, unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
