import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Badge } from "@twt/ui/components/badge"
import { Input } from "@twt/ui/components/input"
import { Spinner } from "@twt/ui/components/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@twt/ui/components/table"
import { Mail, Search } from "lucide-react"
import { useState } from "react"
import { useTRPC } from "../../../lib/trpc"

export const Route = createFileRoute("/studio/subscribers/")({
  component: SubscribersListPage,
})

function SubscribersListPage(): React.ReactElement {
  const trpc = useTRPC()
  const [search, setSearch] = useState("")

  const subscribersQuery = useQuery(trpc.subscribers.list.queryOptions())
  const countQuery = useQuery(trpc.subscribers.count.queryOptions())
  const subscribers = subscribersQuery.data ?? []
  const count = countQuery.data ?? 0

  const filtered = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Subscribers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            People who have signed up for your newsletter.
          </p>
        </div>
        {!countQuery.isPending && (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
            <Mail className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {count} {count === 1 ? "subscriber" : "subscribers"}
            </span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {subscribersQuery.isPending ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="size-8" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
          <Mail className="mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">
            {search ? "No subscribers found" : "No subscribers yet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {search
              ? "Try a different search term."
              : "Subscribers will appear here when people sign up for your newsletter."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead>Unsubscribed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.email}</TableCell>
                  <TableCell>
                    <Badge variant={sub.active ? "default" : "secondary"}>
                      {sub.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(sub.subscribedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {sub.unsubscribedAt
                      ? new Date(sub.unsubscribedAt).toLocaleDateString()
                      : "--"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
