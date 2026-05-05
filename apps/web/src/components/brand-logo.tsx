interface BrandLogoProps {
  className?: string
  variant?: "logo" | "avatar"
}

export function BrandLogo({
  className = "",
  variant = "logo",
}: BrandLogoProps): React.ReactElement {
  if (variant === "avatar") {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-serif text-sm font-semibold text-primary ${className}`}
      >
        TWT
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap font-serif text-2xl font-semibold tracking-normal text-foreground sm:text-3xl ${className}`}
    >
      Tastings with Tay
    </span>
  )
}
