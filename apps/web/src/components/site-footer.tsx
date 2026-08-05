import { Link } from "@tanstack/react-router"
import { Instagram, Mail } from "lucide-react"
import { BrandLogo } from "./brand-logo"

const mainNavigation = [
  { name: "Recipes", to: "/recipes" },
  { name: "Wine Cellar", to: "/wine" },
  { name: "Test Kitchen", to: "/test-kitchen" },
  { name: "About", to: "/about" },
  { name: "Garden & Flock", to: "/garden-and-flock" },
] as const

const socialLinks = [
  { name: "Instagram", href: "https://instagram.com/tastingswithtay", icon: Instagram },
  { name: "Email", href: "mailto:tmcgowen28@gmail.com", icon: Mail },
] as const

export function SiteFooter(): React.ReactElement {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <Link to="/" className="mb-8">
            <BrandLogo className="h-16 w-auto sm:h-20" />
          </Link>

          {/* Navigation */}
          <nav className="mb-8 flex flex-wrap justify-center gap-x-8 gap-y-2">
            {mainNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Social Links */}
          <div className="mb-8 flex gap-6">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target={item.href.startsWith("https://") ? "_blank" : undefined}
                rel={item.href.startsWith("https://") ? "noopener noreferrer" : undefined}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          {/* Newsletter signup hint */}
          <p className="mb-8 max-w-md text-center text-sm text-muted-foreground">
            Subscribe to get the latest recipes, notes, and kitchen inspiration delivered to your
            inbox.
          </p>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Tastings with Tay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
