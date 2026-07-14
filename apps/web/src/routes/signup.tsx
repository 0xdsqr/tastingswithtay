import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router"
import { Button } from "@twt/ui/components/button"
import { Card, CardContent } from "@twt/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@twt/ui/components/field"
import { Input } from "@twt/ui/components/input"
import { PasswordInput } from "@twt/ui/components/password-input"
import { useState } from "react"
import { authClient } from "../auth/client"
import { getServerSession } from "../auth/get-session"
import { OptimizedImage } from "../components/optimized-image"
import { SiteFooter } from "../components/site-footer"
import { SiteHeader } from "../components/site-header"

export const Route = createFileRoute("/signup")({
  beforeLoad: async () => {
    if (await getServerSession()) throw redirect({ to: "/" })
  },
  component: SignupPage,
})

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      role="img"
      aria-labelledby="discord-title-signup"
    >
      <title id="discord-title-signup">Discord</title>
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  )
}

function SignupPage(): React.ReactElement {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await authClient.signUp.email({
        email,
        password,
        name,
      })

      if (res.error) {
        setError("The account could not be created. Try signing in or use a different address.")
      } else {
        navigate({ to: "/" })
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDiscordLogin = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const res = await authClient.signIn.social({
        provider: "discord",
        callbackURL: "/",
      })
      if (res.data?.url) {
        window.location.href = res.data.url
        return
      }
      setError("Discord sign-up is not available right now.")
    } catch {
      setError("Discord sign-up is not available right now.")
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
              <form className="p-8 md:p-12" onSubmit={handleEmailSignup}>
                <FieldGroup>
                  <div className="flex flex-col gap-3 text-center md:text-left">
                    <h1 className="font-serif text-3xl font-bold">Create an account</h1>
                    <p className="text-muted-foreground text-balance text-lg">
                      Join Tastings with Tay to save your favorite recipes, build collections, and
                      be part of our community.
                    </p>
                  </div>

                  {error && <FieldError>{error}</FieldError>}

                  <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={100}
                      className="h-12"
                    />
                  </Field>

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
                      autoComplete="new-password"
                      placeholder="At least 12 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={12}
                      maxLength={128}
                      className="h-12"
                    />
                    <FieldDescription>Must be at least 12 characters long</FieldDescription>
                  </Field>

                  <Field>
                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </Field>

                  <FieldSeparator>Or continue with</FieldSeparator>

                  <Field>
                    <Button
                      variant="outline"
                      size="lg"
                      type="button"
                      className="w-full gap-3"
                      onClick={handleDiscordLogin}
                      disabled={isLoading}
                    >
                      <DiscordIcon className="h-5 w-5" />
                      Continue with Discord
                    </Button>
                  </Field>

                  <FieldDescription className="pt-4 text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                      Sign in
                    </Link>
                  </FieldDescription>
                </FieldGroup>
              </form>

              {/* Image Side */}
              <div className="bg-muted relative hidden md:block">
                <OptimizedImage
                  alt="Wine glass"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <blockquote className="space-y-3">
                    <p className="text-lg italic leading-relaxed">
                      "Cooking is like love. It should be entered into with abandon or not at all."
                    </p>
                    <footer className="text-sm opacity-80">— Harriet Van Horne</footer>
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
