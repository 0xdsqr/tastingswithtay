import { createFileRoute } from "@tanstack/react-router"
import { Avatar, AvatarFallback } from "@twt/react/components/avatar"
import { Badge } from "@twt/react/components/badge"
import { Button } from "@twt/react/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@twt/react/components/card"
import { Input } from "@twt/react/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@twt/react/components/select"
import { Spinner } from "@twt/react/components/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@twt/react/components/table"
import { useDeferredValue, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { PageHeader } from "../components/workspace"
import {
  type AdminUserRecord,
  formatAdminDate,
  listAdminUsers,
  updateAdminUserRole,
} from "../lib/admin-data"
import { initialsFor } from "../lib/format"

export const Route = createFileRoute("/_dashboard/users")({
  loader: () => listAdminUsers(),
  component: UsersPage,
})

type ManagedRole = "admin" | "user"

function toManagedRole(role: string | null | undefined): ManagedRole {
  return role === "admin" ? "admin" : "user"
}

function UsersPage(): React.ReactElement {
  const loaded = Route.useLoaderData()
  const { adminUser } = Route.useRouteContext()
  const currentUserId = adminUser.id ?? ""
  const [users, setUsers] = useState<AdminUserRecord[]>(loaded)
  const [searchValue, setSearchValue] = useState("")
  const [draftRoles, setDraftRoles] = useState<Record<string, ManagedRole>>({})
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const deferredSearch = useDeferredValue(searchValue)

  const filteredUsers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()
    const sorted = [...users].sort((left, right) => {
      const leftAdmin = toManagedRole(left.role) === "admin" ? 1 : 0
      const rightAdmin = toManagedRole(right.role) === "admin" ? 1 : 0

      if (leftAdmin !== rightAdmin) {
        return rightAdmin - leftAdmin
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    })

    if (!query) {
      return sorted
    }

    return sorted.filter((user) =>
      [user.name, user.email, toManagedRole(user.role)].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [deferredSearch, users])

  const saveRole = (user: AdminUserRecord) => {
    const nextRole = draftRoles[user.id] ?? toManagedRole(user.role)
    if (nextRole === toManagedRole(user.role)) {
      return
    }

    setPendingUserId(user.id)

    startTransition(async () => {
      try {
        const updatedUser = await updateAdminUserRole({
          data: {
            userId: user.id,
            role: nextRole,
          },
        })

        setUsers(users.map((entry) => (entry.id === updatedUser.id ? updatedUser : entry)))
        setDraftRoles((current) => {
          const next = { ...current }
          delete next[user.id]
          return next
        })
        toast.success(`${updatedUser.email} is now ${toManagedRole(updatedUser.role)}.`)
      } catch (caughtError) {
        toast.error(
          caughtError instanceof Error
            ? caughtError.message
            : "Could not update that role right now.",
        )
      } finally {
        setPendingUserId(null)
      }
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage accounts and who can access the admin portal."
      />

      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>User directory</CardTitle>
            <CardDescription>Every account, with simple admin-role management.</CardDescription>
          </div>
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search users"
            className="w-full md:max-w-xs"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 md:hidden">
            {filteredUsers.map((user) => {
              const currentRole = toManagedRole(user.role)
              const selectedRole = draftRoles[user.id] ?? currentRole
              const isCurrentUser = user.id === currentUserId
              const isSaving = pendingUserId === user.id && isPending

              return (
                <UserMobileCard
                  key={user.id}
                  user={user}
                  currentRole={currentRole}
                  selectedRole={selectedRole}
                  isCurrentUser={isCurrentUser}
                  isSaving={isSaving}
                  onRoleChange={(value) =>
                    setDraftRoles((current) => ({
                      ...current,
                      [user.id]: value,
                    }))
                  }
                  onSave={() => saveRole(user)}
                />
              )
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const currentRole = toManagedRole(user.role)
                  const selectedRole = draftRoles[user.id] ?? currentRole
                  const isCurrentUser = user.id === currentUserId
                  const isSaving = pendingUserId === user.id && isPending

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{initialsFor(user.name || user.email)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {user.name || "Unnamed user"}
                            </div>
                            {isCurrentUser ? (
                              <div className="text-xs text-muted-foreground">Current session</div>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={selectedRole}
                          onValueChange={(value) =>
                            setDraftRoles((current) => ({
                              ...current,
                              [user.id]: value as ManagedRole,
                            }))
                          }
                          disabled={isCurrentUser}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">admin</SelectItem>
                            <SelectItem value="user">user</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={currentRole === "admin" ? "default" : "secondary"}>
                            {currentRole}
                          </Badge>
                          <Badge variant="outline">
                            {user.emailVerified ? "verified" : "unverified"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{formatAdminDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        {isCurrentUser ? (
                          <span className="text-xs text-muted-foreground">You</span>
                        ) : (
                          <Button
                            size="sm"
                            variant={selectedRole === currentRole ? "outline" : "default"}
                            disabled={isSaving || selectedRole === currentRole}
                            onClick={() => saveRole(user)}
                          >
                            {isSaving ? (
                              <span className="inline-flex items-center gap-2">
                                <Spinner className="size-4" />
                                Saving
                              </span>
                            ) : (
                              "Save"
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UserMobileCard({
  user,
  currentRole,
  selectedRole,
  isCurrentUser,
  isSaving,
  onRoleChange,
  onSave,
}: {
  user: AdminUserRecord
  currentRole: ManagedRole
  selectedRole: ManagedRole
  isCurrentUser: boolean
  isSaving: boolean
  onRoleChange: (value: ManagedRole) => void
  onSave: () => void
}): React.ReactElement {
  return (
    <div className="rounded-md border p-4">
      <div className="flex min-w-0 items-start gap-3">
        <Avatar>
          <AvatarFallback>{initialsFor(user.name || user.email)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{user.name || "Unnamed user"}</div>
          <div className="break-all text-sm text-muted-foreground">{user.email}</div>
          {isCurrentUser ? (
            <div className="mt-1 text-xs text-muted-foreground">Current session</div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant={currentRole === "admin" ? "default" : "secondary"}>{currentRole}</Badge>
        <Badge variant="outline">{user.emailVerified ? "verified" : "unverified"}</Badge>
        <Badge variant="outline">Joined {formatAdminDate(user.createdAt)}</Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Select
          value={selectedRole}
          onValueChange={(value) => onRoleChange(value as ManagedRole)}
          disabled={isCurrentUser}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">admin</SelectItem>
            <SelectItem value="user">user</SelectItem>
          </SelectContent>
        </Select>
        {isCurrentUser ? (
          <Button type="button" variant="outline" disabled>
            You
          </Button>
        ) : (
          <Button
            type="button"
            disabled={isSaving || selectedRole === currentRole}
            onClick={onSave}
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="size-4" />
                Saving
              </span>
            ) : (
              "Save role"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
