import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { Button } from "@twt/react/components/button"
import { Card, CardContent } from "@twt/react/components/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@twt/react/components/field"
import { Input } from "@twt/react/components/input"
import { PasswordInput } from "@twt/react/components/password-input"
import { useState } from "react"
import { authClient } from "../auth/client"
import { getServerSession } from "../auth/get-session"
import { SiteFooter } from "../components/site-footer"
import { SiteHeader } from "../components/site-header"

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    if (await getServerSession()) throw redirect({ to: "/" })
  },
  component: LoginPage,
})

function LoginPage(): React.ReactElement {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await authClient.signIn.email({
        email,
        password,
      })

      if (res.error) {
        setError("The email or password is incorrect.")
      } else {
        navigate({ to: "/" })
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-5xl flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              {/* Form Side */}
              <form className="p-8 md:p-12" onSubmit={handleEmailLogin}>
                <FieldGroup>
                  <div className="flex flex-col gap-3 text-center md:text-left">
                    <h1 className="font-serif text-3xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground text-balance text-lg">
                      Sign in to your Tastings with Tay account.
                    </p>
                  </div>

                  {error && <FieldError>{error}</FieldError>}

                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={255}
                      className="h-12"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <PasswordInput
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      maxLength={128}
                      className="h-12"
                    />
                  </Field>

                  <Field>
                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>

              {/* Quote Side */}
              <div className="relative hidden bg-brand-burgundy md:block">
                <div className="absolute bottom-0 left-0 right-0 p-8 text-brand-cream">
                  <blockquote className="space-y-3">
                    <p className="text-lg italic leading-relaxed">
                      "One cannot think well, love well, sleep well, if one has not dined well."
                    </p>
                    <footer className="text-sm opacity-80">— Virginia Woolf</footer>
                  </blockquote>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
