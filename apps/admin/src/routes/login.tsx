import { createFileRoute, redirect } from "@tanstack/react-router"
import { Button } from "@twt/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@twt/ui/components/card"
import { Input } from "@twt/ui/components/input"
import { Spinner } from "@twt/ui/components/spinner"
import { useState } from "react"
import { authClient } from "../auth/client"
import { getAdminSessionUser } from "../lib/admin-access"

export const Route = createFileRoute("/login")({
  loader: async () => {
    const adminUser = await getAdminSessionUser()
    if (adminUser) {
      throw redirect({ to: "/" })
    }
    return null
  },
  component: AdminLoginPage,
})

function AdminLoginPage(): React.ReactElement {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsPending(true)

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError("The email or password is incorrect.")
        return
      }

      window.location.href = "/"
    } catch {
      setError("Something went wrong while signing in.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_rgba(252,248,242,1)_0%,_rgba(245,238,230,1)_100%)] px-6 py-16">
      <Card className="w-full max-w-md border-border/70 bg-white/90 shadow-xl shadow-black/5">
        <CardHeader>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Tastings with Tay
          </p>
          <CardTitle className="font-serif text-3xl">Admin Login</CardTitle>
          <CardDescription>
            Sign in with an approved admin account. Access is limited to users with the `admin`
            role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">Email</span>
              <Input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">Password</span>
              <Input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                maxLength={128}
              />
            </label>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="size-4" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
