interface BrandLogoProps {
  className?: string
  variant?: "logo" | "avatar"
}

/**
 * Brand logo — illustrated watercolor wordmark with real alpha transparency.
 *
 * - "logo" (default): horizontal wordmark with illustrations for header/footer
 * - "avatar": circular watercolor portrait for profile/social
 *
 * Auto-switches light/dark based on prefers-color-scheme.
 * Images are 2K resolution for crisp rendering at any display density.
 */
export function BrandLogo({
  className = "",
  variant = "logo",
}: BrandLogoProps): React.ReactElement {
  const lightSrc =
    variant === "avatar" ? "/avatar-light.png" : "/logo-light.png"
  const darkSrc = variant === "avatar" ? "/avatar-dark.png" : "/logo-dark.png"

  return (
    <picture>
      <source srcSet={darkSrc} media="(prefers-color-scheme: dark)" />
      <img
        src={lightSrc}
        alt="Tastings with Tay"
        className={className}
        loading={variant === "logo" ? "eager" : "lazy"}
      />
    </picture>
  )
}
