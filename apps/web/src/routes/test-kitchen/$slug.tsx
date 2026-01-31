import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { Badge } from "@twt/ui/components/badge"
import { Button } from "@twt/ui/components/button"
import {
  ArrowLeft,
  ArrowRight,
  Beaker,
  Calendar,
  Camera,
  Clock,
  FlaskConical,
  Lightbulb,
  MessageSquare,
  Pause,
  Repeat,
  Sparkles,
  Trophy,
} from "lucide-react"
import { OptimizedImage } from "../../components/optimized-image"
import { SiteFooter } from "../../components/site-footer"
import { SiteHeader } from "../../components/site-header"

export const Route = createFileRoute("/test-kitchen/$slug")({
  loader: async ({ context, params }) => {
    const experiment = await context.queryClient.fetchQuery(
      context.trpc.experiments.bySlug.queryOptions({ slug: params.slug }),
    )
    if (!experiment) {
      throw notFound()
    }
    return { experiment }
  },
  component: ExperimentDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-serif text-4xl">Experiment not found</h1>
      <a href="/test-kitchen" className="mt-4 text-primary hover:underline">
        Back to Test Kitchen
      </a>
    </div>
  ),
})

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof Beaker }
> = {
  in_progress: {
    label: "In Progress",
    color: "text-amber-800",
    bg: "bg-amber-100",
    icon: FlaskConical,
  },
  paused: {
    label: "Paused",
    color: "text-slate-700",
    bg: "bg-slate-100",
    icon: Pause,
  },
  completed: {
    label: "Completed",
    color: "text-emerald-800",
    bg: "bg-emerald-100",
    icon: Sparkles,
  },
  graduated: {
    label: "Graduated to Recipe",
    color: "text-primary",
    bg: "bg-primary/10",
    icon: Trophy,
  },
}

const entryTypeConfig: Record<
  string,
  { label: string; icon: typeof Beaker; color: string }
> = {
  update: { label: "Update", icon: MessageSquare, color: "bg-blue-500" },
  photo: { label: "Photo", icon: Camera, color: "bg-violet-500" },
  note: { label: "Note", icon: Lightbulb, color: "bg-amber-500" },
  result: { label: "Result", icon: Sparkles, color: "bg-emerald-500" },
  iteration: { label: "Iteration", icon: Repeat, color: "bg-orange-500" },
}

function ExperimentDetailPage(): React.ReactElement {
  const { experiment } = Route.useLoaderData()
  const config = statusConfig[experiment.status] ?? statusConfig.in_progress!
  const StatusIcon = config!.icon

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Back Link */}
        <div className="mx-auto max-w-4xl px-6 pt-8 lg:px-8">
          <a
            href="/test-kitchen"
            className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Test Kitchen
          </a>
        </div>

        {/* Experiment Header */}
        <article className="py-12 lg:py-16">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            {/* Status + Meta */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ${config!.bg} ${config!.color}`}
              >
                <StatusIcon className="size-3.5" />
                {config!.label}
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="size-3.5" />
                Started{" "}
                {new Date(experiment.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="size-3.5" />
                Last updated{" "}
                {new Date(experiment.updatedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-4 font-serif text-4xl text-foreground lg:text-5xl">
              {experiment.title}
            </h1>

            {/* Description */}
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              {experiment.description}
            </p>

            {/* Cover Image */}
            {experiment.image && (
              <div className="mb-8 overflow-hidden rounded-2xl">
                <OptimizedImage
                  src={experiment.image}
                  alt={experiment.title}
                  priority
                  className="w-full object-cover"
                />
              </div>
            )}

            {/* Hypothesis */}
            {experiment.hypothesis && (
              <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="mb-2 flex items-center gap-2 font-serif text-lg text-amber-900">
                  <Lightbulb className="size-5" />
                  The Hypothesis
                </h2>
                <p className="leading-relaxed text-amber-800">
                  {experiment.hypothesis}
                </p>
              </div>
            )}

            {/* Result (if completed/graduated) */}
            {experiment.result && (
              <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
                <h2 className="mb-2 flex items-center gap-2 font-serif text-lg text-emerald-900">
                  <Sparkles className="size-5" />
                  The Result
                </h2>
                <p className="leading-relaxed text-emerald-800">
                  {experiment.result}
                </p>
              </div>
            )}

            {/* Graduated link */}
            {experiment.status === "graduated" && experiment.recipeId && (
              <div className="mb-8 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-6">
                <Trophy className="size-6 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    This experiment graduated to a full recipe!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The experiment was a success and became an official recipe.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/recipes" className="flex items-center gap-2">
                    View Recipe
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              </div>
            )}

            {/* Tags */}
            {experiment.tags && experiment.tags.length > 0 && (
              <div className="mb-12 flex flex-wrap gap-2">
                {experiment.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Timeline */}
            {experiment.entries && experiment.entries.length > 0 && (
              <div className="border-t border-border pt-12">
                <h2 className="mb-8 font-serif text-2xl text-foreground">
                  Kitchen Journal
                </h2>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute bottom-0 left-5 top-0 w-px bg-border" />

                  <div className="space-y-8">
                    {experiment.entries.map((entry) => {
                      const entryConfig =
                        entryTypeConfig[entry.entryType] ??
                        entryTypeConfig.update!
                      const EntryIcon = entryConfig!.icon

                      return (
                        <div key={entry.id} className="relative pl-14">
                          {/* Timeline dot */}
                          <div
                            className={`absolute left-3 top-1 flex size-5 items-center justify-center rounded-full ${entryConfig!.color}`}
                          >
                            <EntryIcon className="size-3 text-white" />
                          </div>

                          {/* Entry content */}
                          <div className="rounded-xl border border-border bg-card p-6">
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                              <Badge variant="outline" className="text-xs">
                                {entryConfig!.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(entry.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>

                            <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                              {entry.content}
                            </p>

                            {/* Entry images */}
                            {entry.images &&
                              (entry.images as string[]).length > 0 && (
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                  {(entry.images as string[]).map(
                                    (img, idx) => (
                                      <div
                                        key={idx}
                                        className="overflow-hidden rounded-lg"
                                      >
                                        <OptimizedImage
                                          src={img}
                                          alt={`Entry photo ${idx + 1}`}
                                          className="w-full object-cover"
                                        />
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Empty entries state */}
            {(!experiment.entries || experiment.entries.length === 0) && (
              <div className="border-t border-border pt-12">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Beaker className="mb-4 size-12 text-muted-foreground/50" />
                  <h3 className="mb-2 font-serif text-xl text-muted-foreground">
                    The experiment has just begun
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Check back soon for updates from the kitchen.
                  </p>
                </div>
              </div>
            )}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
