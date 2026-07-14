import { getRouteApi, Link, useNavigate } from "@tanstack/react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@twt/ui/components/avatar"
import { Button } from "@twt/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@twt/ui/components/dropdown-menu"
import { Skeleton } from "@twt/ui/components/skeleton"
import { LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { authClient } from "../auth/client"
import { BrandLogo } from "./brand-logo"

const navigation = [
  { name: "Recipes", to: "/recipes" },
  { name: "Wine Cellar", to: "/wine" },
  { name: "Test Kitchen", to: "/test-kitchen" },
  { name: "About", to: "/about" },
  { name: "Garden & Flock", to: "/garden-and-flock" },
] as const

const rootRoute = getRouteApi("__root__")

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  if (email && email.length > 0) {
    return email.charAt(0).toUpperCase()
  }
  return "?"
}

export function SiteHeader(): React.ReactElement {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { session: initialSession } = rootRoute.useLoaderData()
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()
  const resolvedSession = session ?? (isPending ? initialSession : null)
  const showSessionSkeleton = isPending && !initialSession

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Left nav - desktop */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.slice(0, 3).map((item) => (
            <Link
              key={item.name}
              to={item.to}
              className="text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? "Close main menu" : "Open main menu"}
            className="inline-flex items-center justify-center p-2 text-foreground"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Logo - center */}
        <div className="flex flex-1 justify-center lg:flex-none">
          <Link to="/" className="flex items-center">
            <BrandLogo className="h-10 w-auto sm:h-12 lg:h-16" />
          </Link>
        </div>

        {/* Right nav - desktop */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-6">
          {navigation.slice(3).map((item) => (
            <Link
              key={item.name}
              to={item.to}
              className="text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
          {showSessionSkeleton ? (
            <Skeleton className="size-8 rounded-full" />
          ) : resolvedSession ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <Avatar className="size-8">
                    <AvatarImage
                      src={resolvedSession.user.image ?? undefined}
                      alt={resolvedSession.user.name ?? "User avatar"}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(resolvedSession.user.name, resolvedSession.user.email)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    {resolvedSession.user.name && (
                      <p className="text-sm font-medium leading-none">
                        {resolvedSession.user.name}
                      </p>
                    )}
                    <p className="text-xs leading-none text-muted-foreground">
                      {resolvedSession.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await authClient.signOut()
                    navigate({ to: "/" })
                  }}
                >
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="border-t border-border bg-background lg:hidden">
          <div className="space-y-1 px-6 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="block py-3 text-base font-medium text-foreground transition-colors hover:text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-border pt-4">
              {showSessionSkeleton ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : resolvedSession ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 px-1">
                    <Avatar className="size-8">
                      <AvatarImage
                        src={resolvedSession.user.image ?? undefined}
                        alt={resolvedSession.user.name ?? "User avatar"}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(resolvedSession.user.name, resolvedSession.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      {resolvedSession.user.name && (
                        <span className="text-sm font-medium">{resolvedSession.user.name}</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {resolvedSession.user.email}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={async () => {
                      await authClient.signOut()
                      setMobileMenuOpen(false)
                      navigate({ to: "/" })
                    }}
                  >
                    <LogOut className="mr-2 size-4" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
