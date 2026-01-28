import { useNavigate } from "@tanstack/react-router"
import { Button } from "@twt/ui/components/button"
import { authClient } from "../auth/client"

export function AuthShowcase(): React.ReactElement {
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()

  if (isPending) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Loading...
      </Button>
    )
  }

  if (!session) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate({ to: "/login" })}
      >
        Sign In
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        {session.user.name || session.user.email}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={async () => {
          await authClient.signOut()
          navigate({ to: "/" })
        }}
      >
        Sign Out
      </Button>
    </div>
  )
}
