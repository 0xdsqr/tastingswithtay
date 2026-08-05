import { getRouteApi, Link, useNavigate } from "@tanstack/react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@twt/react/components/avatar"
import { Button } from "@twt/react/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@twt/react/components/dropdown-menu"
import { Skeleton } from "@twt/react/components/skeleton"
import { LogOut, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
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

export function SiteHeader({ overlay = false }: { overlay?: boolean }): React.ReactElement {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { session: initialSession } = rootRoute.useLoaderData()
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()
  const resolvedSession = session ?? (isPending ? initialSession : null)
  const showSessionSkeleton = isPending && !initialSession
  const transparent = overlay && !isScrolled && !mobileMenuOpen

  useEffect(() => {
    if (!overlay) return

    const updateHeader = (): void => setIsScrolled(window.scrollY > 24)
    updateHeader()
    window.addEventListener("scroll", updateHeader, { passive: true })
    return () => window.removeEventListener("scroll", updateHeader)
  }, [overlay])

  return (
    <header
      className={`top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        overlay ? "fixed" : "sticky"
      } ${
        transparent
          ? "border-transparent bg-transparent"
          : "border-border bg-background/90 shadow-sm backdrop-blur-md"
      }`}
    >
      <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-2 sm:px-6 sm:py-3 lg:px-8">
        {/* Left nav - desktop */}
        <div className="hidden justify-self-start lg:flex lg:gap-x-8">
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
        <div className="flex justify-self-start lg:hidden">
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
        <div className="flex justify-self-center">
          <Link to="/" aria-label="Tastings with Tay home" className="flex items-center">
            <BrandLogo
              variant="editorial"
              loading="eager"
              sizes="(min-width: 1280px) 224px, (min-width: 1024px) 208px, (min-width: 640px) 192px, 160px"
              className={`w-40 sm:w-48 lg:w-52 xl:w-56 ${
                transparent ? "drop-shadow-[0_1px_7px_rgba(255,255,255,0.72)]" : ""
              }`}
            />
          </Link>
        </div>

        {/* Right nav - desktop */}
        <div className="hidden justify-self-end lg:flex lg:items-center lg:gap-x-6">
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
          ) : null}
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
            {showSessionSkeleton || resolvedSession ? (
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
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  )
}
