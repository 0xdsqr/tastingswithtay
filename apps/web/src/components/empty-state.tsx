import type { LucideIcon } from "lucide-react"

interface GhostCardProps {
  aspectRatio?: string
  className?: string
}

function GhostCard({
  aspectRatio = "aspect-[4/3]",
  className = "",
}: GhostCardProps): React.ReactElement {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border bg-card ${className}`}
    >
      <div className={`${aspectRatio} bg-muted`} />
      <div className="space-y-3 p-5">
        <div className="h-3 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="flex gap-3">
          <div className="h-2.5 w-16 rounded bg-muted" />
          <div className="h-2.5 w-12 rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}

function GhostWineCard({
  className = "",
}: {
  className?: string
}): React.ReactElement {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border bg-card ${className}`}
    >
      <div className="aspect-[4/3] bg-muted" />
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-muted" />
            <div className="h-2.5 w-20 rounded bg-muted" />
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="size-3 rounded-full bg-muted" />
            ))}
          </div>
        </div>
        <div className="h-2.5 w-24 rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-5 w-14 rounded-full bg-muted" />
          <div className="h-5 w-12 rounded-full bg-muted" />
          <div className="h-5 w-16 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  )
}

function GhostPostCard({
  className = "",
}: {
  className?: string
}): React.ReactElement {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="mb-4 aspect-[4/3] rounded-xl bg-muted" />
      <div className="space-y-3">
        <div className="h-3 w-3/4 rounded bg-muted" />
        <div className="h-2.5 w-full rounded bg-muted" />
        <div className="h-2.5 w-2/3 rounded bg-muted" />
        <div className="flex gap-3 pt-1">
          <div className="h-2.5 w-10 rounded bg-muted" />
          <div className="h-2.5 w-10 rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}

type GhostVariant = "recipe" | "wine" | "post"

interface EmptyStateProps {
  icon: LucideIcon
  heading: string
  message: string
  variant?: GhostVariant
  columns?: number
}

export function EmptyState({
  icon: Icon,
  heading,
  message,
  variant = "recipe",
  columns = 3,
}: EmptyStateProps): React.ReactElement {
  const ghostCards = Array.from({ length: columns })

  return (
    <div className="relative">
      {/* Ghost placeholder grid */}
      <div
        className="select-none"
        aria-hidden="true"
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, transparent 85%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, transparent 85%)",
        }}
      >
        <div className="grid gap-8 opacity-40 blur-[2px] md:grid-cols-2 lg:grid-cols-3">
          {ghostCards.map((_, i) => {
            if (variant === "wine") {
              return <GhostWineCard key={i} />
            }
            if (variant === "post") {
              return <GhostPostCard key={i} />
            }
            return <GhostCard key={i} />
          })}
        </div>
      </div>

      {/* Centered overlay message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Icon className="size-7 text-muted-foreground" />
          </div>
          <h3 className="font-serif text-2xl text-foreground">{heading}</h3>
          <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  )
}

export { GhostCard, GhostWineCard, GhostPostCard }
