interface BrandLogoProps {
  className?: string
}

/**
 * Simple brand text — "tastingswithtay"
 *
 * Clean, centered, uses the display serif font.
 * The illustrated logo mark is a separate asset (used elsewhere).
 */
export function BrandLogo({ className = "" }: BrandLogoProps): React.ReactElement {
  return (
    <span
      className={`font-display text-2xl tracking-wide text-foreground lg:text-3xl ${className}`}
    >
      tastingswithtay
    </span>
  )
}
