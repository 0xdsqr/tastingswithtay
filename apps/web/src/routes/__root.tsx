import type { QueryClient } from "@tanstack/react-query"
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router"
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query"
import type { AppRouter } from "@twt/core/api"
import { ErrorBoundary } from "@twt/ui/components/error-boundary"
import appCss from "../styles.css?url"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  trpc: TRPCOptionsProxy<AppRouter>
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Tastings with Tay | Recipes, Life & Good Food" },
      {
        name: "description",
        content:
          "Join Tay on a culinary journey through delicious recipes, lifestyle tips, and curated kitchen essentials.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        href: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        rel: "icon",
        href: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      { rel: "apple-touch-icon", href: "/apple-icon.png" },
    ],
  }),
  component: RootComponent,
})

function RootComponent(): React.ReactElement {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
        <Scripts />
      </body>
    </html>
  )
}
