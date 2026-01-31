import { Link, useNavigate } from "@tanstack/react-router"
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
import { LogOut, Menu, Search, ShoppingBag, X } from "lucide-react"
import { useState } from "react"
import { authClient } from "../auth/client"

const navigation = [
  { name: "Recipes", to: "/recipes" },
  { name: "Wine Cellar", to: "/wine" },
  { name: "Test Kitchen", to: "/test-kitchen" },
  { name: "About", to: "/about" },
  { name: "Shop", to: "/shop" },
] as const

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
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()

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
            className="inline-flex items-center justify-center p-2 text-foreground"
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Logo - center */}
        <div className="flex flex-1 justify-center lg:flex-none">
          <Link to="/" className="flex flex-col items-center">
            <span className="font-serif text-2xl tracking-tight text-foreground lg:text-3xl">
              Tastings with Tay
            </span>
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
          <button
            type="button"
            className="p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </button>
          <Link
            to="/cart"
            className="relative p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="sr-only">Cart</span>
          </Link>
          {isPending ? (
            <Skeleton className="size-8 rounded-full" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <Avatar className="size-8">
                    <AvatarImage
                      src={session.user.image ?? undefined}
                      alt={session.user.name ?? "User avatar"}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(session.user.name, session.user.email)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    {session.user.name && (
                      <p className="text-sm font-medium leading-none">
                        {session.user.name}
                      </p>
                    )}
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
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

        {/* Mobile icons */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/cart"
            className="p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="sr-only">Cart</span>
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background lg:hidden">
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
              {isPending ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : session ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 px-1">
                    <Avatar className="size-8">
                      <AvatarImage
                        src={session.user.image ?? undefined}
                        alt={session.user.name ?? "User avatar"}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(session.user.name, session.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      {session.user.name && (
                        <span className="text-sm font-medium">
                          {session.user.name}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {session.user.email}
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
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  asChild
                >
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
