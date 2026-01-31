interface BrandLogoProps {
  className?: string
  variant?: "logo" | "avatar"
}

/**
 * Brand logo — illustrated watercolor wordmark.
 *
 * - "logo" (default): horizontal wordmark with illustrations for header/footer
 * - "avatar": circular watercolor portrait for profile/social
 *
 * Automatically switches between light/dark variants based on color scheme.
 */
export function BrandLogo({
  className = "",
  variant = "logo",
}: BrandLogoProps): React.ReactElement {
  const lightSrc = variant === "avatar" ? "/avatar-light.png" : "/logo-light.png"
  const darkSrc = variant === "avatar" ? "/avatar-dark.png" : "/logo-dark.png"

  return (
    <>
      <img
        src={lightSrc}
        alt="Tastings with Tay"
        className={`dark:hidden ${className}`}
      />
      <img
        src={darkSrc}
        alt="Tastings with Tay"
        className={`hidden dark:block ${className}`}
      />
    </>
  )
}
