import { Quote } from "lucide-react"
import { cn } from "../lib/utils"

interface ContentCalloutProps {
  children: React.ReactNode
  className?: string
  label?: string
}

export function ContentCallout({
  children,
  className,
  label = "Kitchen note",
}: ContentCalloutProps): React.ReactElement {
  return (
    <aside
      aria-label={label}
      className={cn(
        "relative overflow-hidden rounded-xl border border-brand-gold/40 bg-brand-cream px-4 py-4 shadow-sm sm:px-5",
        className,
      )}
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-brand-burgundy" aria-hidden="true" />
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-burgundy/10 text-brand-burgundy">
          <Quote className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-burgundy">
            {label}
          </p>
          <div className="text-sm leading-relaxed text-foreground/85 sm:text-[0.95rem]">
            {children}
          </div>
        </div>
      </div>
    </aside>
  )
}
