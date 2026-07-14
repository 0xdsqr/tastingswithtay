import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router"
import { ErrorBoundary } from "@twt/ui/components/error-boundary"
import { getServerSession } from "../auth/get-session"
import appCss from "../styles.css?url"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  loader: async () => ({
    session: await getServerSession(),
  }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Tastings with Tay Admin" },
      {
        name: "description",
        content: "Private admin workspace for Tastings with Tay.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  notFoundComponent: AdminNotFound,
  component: RootComponent,
})

function RootComponent(): React.ReactElement {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <a
          href="#admin-main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-md bg-background px-4 py-2 text-foreground shadow focus:translate-y-0"
        >
          Skip to admin content
        </a>
        <ErrorBoundary>
          <div id="admin-main-content" tabIndex={-1}>
            <Outlet />
          </div>
        </ErrorBoundary>
        <Scripts />
      </body>
    </html>
  )
}

function AdminNotFound(): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_rgba(252,248,242,1)_0%,_rgba(245,238,230,1)_100%)] px-6 py-16">
      <div className="w-full max-w-lg rounded-[28px] border border-border/70 bg-white/90 p-8 text-center shadow-xl shadow-black/5">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Tastings with Tay
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-foreground">
          This page is not here
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Head back to the admin home page and we&apos;ll keep going from there.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex rounded-full bg-[#8f5b3c] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#7c4f34]"
        >
          Return to Admin
        </a>
      </div>
    </main>
  )
}
