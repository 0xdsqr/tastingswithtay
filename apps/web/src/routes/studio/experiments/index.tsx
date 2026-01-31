import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Badge } from "@twt/ui/components/badge"
import { Button } from "@twt/ui/components/button"
import { Input } from "@twt/ui/components/input"
import { Spinner } from "@twt/ui/components/spinner"
import { Switch } from "@twt/ui/components/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@twt/ui/components/table"
import { Beaker, FileText, Plus, Search } from "lucide-react"
import { useState } from "react"
import { useTRPC } from "../../../lib/trpc"

export const Route = createFileRoute("/studio/experiments/")({
  component: ExperimentsListPage,
})

const statusBadgeVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  in_progress: "default",
  paused: "secondary",
  completed: "outline",
  graduated: "default",
}

const statusLabels: Record<string, string> = {
  in_progress: "In Progress",
  paused: "Paused",
  completed: "Completed",
  graduated: "Graduated",
}

function ExperimentsListPage(): React.ReactElement {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")

  const experimentsQuery = useQuery(trpc.experiments.adminList.queryOptions())
  const experiments = experimentsQuery.data ?? []

  const updateMutation = useMutation(
    trpc.experiments.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.experiments.adminList.queryKey(),
        })
      },
    }),
  )

  const filtered = experiments.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()),
  )

  const togglePublished = (id: string, current: boolean) => {
    updateMutation.mutate({ id, data: { published: !current } })
  }

  const toggleFeatured = (id: string, current: boolean) => {
    updateMutation.mutate({ id, data: { featured: !current } })
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Experiments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your test kitchen experiments. Toggle publish to make them
            visible on the site.
          </p>
        </div>
        <Button asChild>
          <Link to="/studio/experiments/new">
            <Plus className="mr-2 size-4" />
            New Experiment
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search experiments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {experimentsQuery.isPending ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="size-8" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
          <Beaker className="mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">
            {search ? "No experiments found" : "No experiments yet"}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {search
              ? "Try a different search term."
              : "Start your first experiment in the test kitchen."}
          </p>
          {!search && (
            <Button asChild>
              <Link to="/studio/experiments/new">
                <Plus className="mr-2 size-4" />
                New Experiment
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Entries</TableHead>
                <TableHead className="text-center">Published</TableHead>
                <TableHead className="text-center">Featured</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((experiment) => (
                <TableRow key={experiment.id}>
                  <TableCell>
                    <Link
                      to="/studio/experiments/$id/edit"
                      params={{ id: experiment.id }}
                      className="font-medium hover:underline"
                    >
                      {experiment.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        statusBadgeVariant[experiment.status] ?? "secondary"
                      }
                    >
                      {statusLabels[experiment.status] ?? experiment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <FileText className="size-3" />
                      {experiment.entryCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={experiment.published}
                      onCheckedChange={() =>
                        togglePublished(experiment.id, experiment.published)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={experiment.featured}
                      onCheckedChange={() =>
                        toggleFeatured(experiment.id, experiment.featured)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(experiment.updatedAt).toLocaleDateString()}
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
