import { Link, createFileRoute } from "@tanstack/react-router"
import { Badge } from "@twt/react/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@twt/react/components/card"
import { type DashboardActivityEntry, formatAdminDate, getDashboardData } from "../lib/admin-data"
import { PageHeader } from "../components/workspace"

export const Route = createFileRoute("/_dashboard/")({
  loader: () => getDashboardData(),
  component: DashboardPage,
})

function DashboardPage(): React.ReactElement {
  const { stats, activity } = Route.useLoaderData()
  const publishedTotal =
    stats.publishedRecipes +
    stats.publishedWines +
    stats.publishedExperiments +
    stats.publishedGallery

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="What's live on the site and what changed recently."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Published content"
          value={String(publishedTotal)}
          description="Live recipes, wines, experiments, and gallery photos"
        />
        <SummaryCard
          title="Users"
          value={String(stats.users)}
          description={`${stats.admins} with admin access`}
        />
        <SummaryCard
          title="Drafts"
          value={String(
            stats.recipes + stats.wines + stats.experiments + stats.gallery - publishedTotal,
          )}
          description="Saved but not yet published"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content at a glance</CardTitle>
            <CardDescription>Published / total for each content area.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ContentRow
              label="Recipes"
              to="/recipes"
              published={stats.publishedRecipes}
              total={stats.recipes}
            />
            <ContentRow
              label="Wines"
              to="/wines"
              published={stats.publishedWines}
              total={stats.wines}
            />
            <ContentRow
              label="Test Kitchen"
              to="/experiments"
              published={stats.publishedExperiments}
              total={stats.experiments}
            />
            <ContentRow
              label="Garden & Flock"
              to="/gallery"
              published={stats.publishedGallery}
              total={stats.gallery}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>The latest saves, publishes, and uploads.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No admin activity recorded yet.</p>
            ) : (
              activity.map((entry) => <ActivityRow key={entry.id} entry={entry} />)
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}): React.ReactElement {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
    </Card>
  )
}

function ContentRow({
  label,
  to,
  published,
  total,
}: {
  label: string
  to: string
  published: number
  total: number
}): React.ReactElement {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50"
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm text-muted-foreground">
        {published} published · {total} total
      </span>
    </Link>
  )
}

const actionLabels: Record<string, string> = {
  "recipe.create": "created recipe",
  "recipe.update": "updated recipe",
  "recipe.delete": "deleted recipe",
  "wine.create": "created wine",
  "wine.update": "updated wine",
  "wine.delete": "deleted wine",
  "experiment.create": "created experiment",
  "experiment.update": "updated experiment",
  "experiment.delete": "deleted experiment",
  "gallery.create": "added gallery photo",
  "gallery.update": "updated gallery photo",
  "gallery.delete": "deleted gallery photo",
  "asset.upload": "uploaded photo",
  "asset.delete": "deleted photo",
  "site.draft.save": "saved page draft",
  "site.publish": "published site pages",
  "user.role.update": "changed a user role",
}

function ActivityRow({ entry }: { entry: DashboardActivityEntry }): React.ReactElement {
  return (
    <div className="flex items-start justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <div className="text-sm">
          <span className="font-medium">{entry.actorName}</span>{" "}
          {actionLabels[entry.action] ?? entry.action}
        </div>
        <div className="truncate text-xs text-muted-foreground">{entry.targetId}</div>
      </div>
      <Badge variant="outline" className="shrink-0">
        {formatAdminDate(entry.createdAt)}
      </Badge>
    </div>
  )
}
