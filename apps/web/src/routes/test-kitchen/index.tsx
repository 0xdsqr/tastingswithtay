import { createFileRoute, Link } from "@tanstack/react-router"
import type { Experiment } from "@twt/db/schema"
import { Badge } from "@twt/ui/components/badge"
import {
  ArrowRight,
  Beaker,
  Calendar,
  Clock,
  FlaskConical,
  Pause,
  Sparkles,
  Trophy,
} from "lucide-react"
import { EmptyState } from "../../components/empty-state"
import { OptimizedImage } from "../../components/optimized-image"
import { SiteFooter } from "../../components/site-footer"
import { SiteHeader } from "../../components/site-header"

const statusFilters = [
  "All",
  "In Progress",
  "Paused",
  "Completed",
  "Graduated",
] as const

const statusMap: Record<string, string> = {
  "In Progress": "in_progress",
  Paused: "paused",
  Completed: "completed",
  Graduated: "graduated",
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: typeof Beaker }
> = {
  in_progress: {
    label: "In Progress",
    color: "bg-amber-100 text-amber-800",
    icon: FlaskConical,
  },
  paused: {
    label: "Paused",
    color: "bg-slate-100 text-slate-700",
    icon: Pause,
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-800",
    icon: Sparkles,
  },
  graduated: {
    label: "Graduated",
    color: "bg-primary/10 text-primary",
    icon: Trophy,
  },
}

export const Route = createFileRoute("/test-kitchen/")({
  validateSearch: (search: Record<string, unknown>) => ({
    status: (search.status as string) || undefined,
  }),
  loaderDeps: ({ search }) => ({ status: search.status }),
  loader: async ({ context, deps }) => {
    const experiments = (await context.queryClient.fetchQuery(
      context.trpc.experiments.list.queryOptions({
        status: deps.status,
      }),
    )) as Experiment[]
    return { experiments, activeStatus: deps.status ?? "All" }
  },
  component: TestKitchenPage,
})

function ExperimentCard({
  experiment,
}: {
  experiment: Experiment
}): React.ReactElement {
  const config = statusConfig[experiment.status] ?? statusConfig.in_progress!
  const StatusIcon = config!.icon

  return (
    <Link
      to="/test-kitchen/$slug"
      params={{ slug: experiment.slug }}
      className="group block"
    >
      <article className="overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
        <div className="relative aspect-[16/9] overflow-hidden">
          {experiment.image ? (
            <OptimizedImage
              src={experiment.image}
              alt={experiment.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
              <FlaskConical className="size-12 text-amber-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          <div className="absolute left-4 top-4">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.color}`}
            >
              <StatusIcon className="size-3" />
              {config.label}
            </span>
          </div>
          {experiment.featured && (
            <div className="absolute right-4 top-4">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Featured
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="mb-2 font-serif text-xl text-foreground transition-colors group-hover:text-primary">
            {experiment.title}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {experiment.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {new Date(experiment.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                Updated{" "}
                {new Date(experiment.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        </div>
      </article>
    </Link>
  )
}

function TestKitchenPage(): React.ReactElement {
  const { experiments, activeStatus } = Route.useLoaderData()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-background" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-amber-400 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-orange-300 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8">
            <Beaker className="mx-auto mb-6 h-12 w-12 text-amber-600" />
            <h1 className="text-balance mb-4 font-serif text-4xl text-foreground sm:text-5xl lg:text-6xl">
              The Test Kitchen
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Where recipes are born. Follow along as I experiment, iterate, and
              discover new flavors. Some of these will become full recipes --
              others are just delicious learning experiences.
            </p>
          </div>
        </section>

        {/* Filter & Experiment Grid */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Filter Tabs */}
            <div className="mb-12 flex flex-wrap justify-center gap-3">
              {statusFilters.map((status) => {
                const isActive =
                  status === "All"
                    ? activeStatus === "All"
                    : statusMap[status] === activeStatus
                return (
                  <a
                    key={status}
                    href={
                      status === "All"
                        ? "/test-kitchen"
                        : `/test-kitchen?status=${statusMap[status]}`
                    }
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {status}
                  </a>
                )
              })}
            </div>

            {/* Experiment Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {experiments.map((experiment) => (
                <ExperimentCard key={experiment.id} experiment={experiment} />
              ))}
            </div>

            {/* Empty State */}
            {experiments.length === 0 && (
              <EmptyState
                icon={Beaker}
                heading={
                  activeStatus !== "All"
                    ? `No ${activeStatus} experiments`
                    : "The kitchen is warming up"
                }
                message={
                  activeStatus !== "All"
                    ? "Check back soon or try a different filter."
                    : "Tay is cooking up something new. Check back soon!"
                }
                variant="recipe"
              />
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
