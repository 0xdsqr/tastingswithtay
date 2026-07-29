import { cn } from "../lib/utils"

function Eyebrow({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}): React.ReactElement {
  return (
    <p
      className={cn(
        "text-sm font-medium uppercase tracking-widest text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  )
}

/**
 * The brand section heading: small uppercase eyebrow over a serif title.
 * Keep every section on this component so type and spacing stay consistent.
 */
function SectionHeader({
  eyebrow,
  title,
  align = "left",
  eyebrowClassName,
  titleClassName,
  className,
}: {
  eyebrow?: string
  title: string
  align?: "left" | "center"
  eyebrowClassName?: string
  titleClassName?: string
  className?: string
}): React.ReactElement {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {eyebrow ? <Eyebrow className={cn("mb-2", eyebrowClassName)}>{eyebrow}</Eyebrow> : null}
      <h2
        className={cn(
          "text-balance font-serif text-3xl tracking-tight text-foreground sm:text-4xl",
          titleClassName,
        )}
      >
        {title}
      </h2>
    </div>
  )
}

export { Eyebrow, SectionHeader }
