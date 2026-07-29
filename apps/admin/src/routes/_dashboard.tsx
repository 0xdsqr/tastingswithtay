import { Link, Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router"
import { Avatar, AvatarFallback } from "@twt/react/components/avatar"
import { Badge } from "@twt/react/components/badge"
import { Button } from "@twt/react/components/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@twt/react/components/sidebar"
import { useTransition } from "react"
import { authClient } from "../auth/client"
import { getAdminSessionUser } from "../lib/admin-access"
import { initialsFor } from "../lib/format"

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async () => {
    const adminUser = await getAdminSessionUser()
    if (!adminUser) {
      throw redirect({ to: "/login" })
    }
    return { adminUser }
  },
  loader: ({ context }) => ({ adminUser: context.adminUser }),
  component: DashboardLayout,
})

const navSections = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard" }],
  },
  {
    label: "Content",
    items: [
      { to: "/pages", label: "Pages" },
      { to: "/media", label: "Media" },
      { to: "/recipes", label: "Recipes" },
      { to: "/wines", label: "Wines" },
      { to: "/experiments", label: "Test Kitchen" },
      { to: "/gallery", label: "Garden & Flock" },
    ],
  },
  {
    label: "Access",
    items: [{ to: "/users", label: "Users" }],
  },
] as const

function DashboardLayout(): React.ReactElement {
  const { adminUser } = Route.useLoaderData()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [signingOut, startSignOutTransition] = useTransition()

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="gap-1 p-4">
          <div className="text-sm font-semibold">Tastings with Tay</div>
          <div className="text-xs text-muted-foreground">Admin portal</div>
        </SidebarHeader>

        <SidebarContent>
          {navSections.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.to}
                        tooltip={item.label}
                      >
                        <Link to={item.to}>
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {initialsFor(adminUser.name || adminUser.email || "A")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {adminUser.name || adminUser.email}
              </div>
              <div className="truncate text-xs text-muted-foreground">{adminUser.email}</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            disabled={signingOut}
            onClick={() => {
              startSignOutTransition(async () => {
                await authClient.signOut()
                window.location.href = "/login"
              })
            }}
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
          <header className="flex items-center justify-between gap-3 border-b pb-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden" />
              <span className="text-sm text-muted-foreground">Tastings with Tay admin</span>
            </div>
            <Badge variant="secondary">{adminUser.role || "admin"}</Badge>
          </header>

          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
