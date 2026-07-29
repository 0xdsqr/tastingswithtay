import { Button } from "@twt/react/components/button"
import { Input } from "@twt/react/components/input"
import { type FormEvent, type ReactElement, useId, useState } from "react"
import { useTRPCClient } from "../lib/trpc"

type NewsletterSignupFormProps = {
  appearance: "card" | "section"
}

export function NewsletterSignupForm({ appearance }: NewsletterSignupFormProps): ReactElement {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputId = useId()
  const statusId = useId()
  const trpcClient = useTRPCClient()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setMessage(null)

    void trpcClient.subscribers.subscribe
      .mutate({ email: email.trim() })
      .then((result) => {
        setMessage(result.message)
        setEmail("")
      })
      .catch(() => {
        setMessage("Could not subscribe right now. Please wait a moment and try again.")
      })
      .finally(() => setIsSubmitting(false))
  }

  const isCard = appearance === "card"

  return (
    <div className={isCard ? "w-full lg:w-auto" : "mx-auto max-w-md"}>
      <form
        onSubmit={handleSubmit}
        className={isCard ? "flex gap-2" : "flex flex-col gap-3 sm:flex-row"}
        aria-busy={isSubmitting}
        aria-describedby={message ? statusId : undefined}
      >
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <Input
          id={inputId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          maxLength={255}
          disabled={isSubmitting}
          className={
            isCard
              ? "w-full border-brand-cream/20 bg-brand-cream/10 text-brand-cream placeholder:text-brand-cream/50 focus-visible:ring-brand-gold/40 lg:w-64"
              : "flex-1 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-primary-foreground/50"
          }
        />
        <Button
          type="submit"
          variant="secondary"
          size={isCard ? "sm" : "default"}
          className={
            isCard
              ? "shrink-0 bg-brand-gold text-brand-charcoal hover:bg-brand-gold/90"
              : "shrink-0"
          }
          disabled={isSubmitting}
        >
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>

      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className={`${isCard ? "text-brand-cream/80" : "opacity-80"} mt-3 min-h-5 text-sm`}
      >
        {message}
      </p>
    </div>
  )
}
