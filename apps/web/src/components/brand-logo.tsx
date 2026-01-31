interface BrandLogoProps {
  className?: string
  variant?: "full" | "icon"
}

/**
 * Brand wordmark — "tastings with / Tay"
 *
 * Uses inline SVG with web fonts (Cormorant Garamond + Dancing Script)
 * so it renders correctly anywhere the CSS is loaded.
 *
 * Palette: brand-charcoal text, brand-gold accents, brand-sage leaf.
 * Dark mode: inverts to warm cream/gold tones.
 */
export function BrandLogo({
  className = "",
  variant = "full",
}: BrandLogoProps): React.ReactElement {
  if (variant === "icon") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        className={className}
        role="img"
        aria-label="Tastings with Tay"
      >
        {/* Gold circle frame */}
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          className="stroke-brand-gold"
          strokeWidth="1.5"
          opacity="0.5"
        />
        {/* Script "T" monogram */}
        <text
          x="32"
          y="44"
          fontFamily="var(--font-script), cursive"
          fontSize="36"
          fontWeight="600"
          className="fill-brand-charcoal dark:fill-brand-cream"
          textAnchor="middle"
        >
          T
        </text>
        {/* Leaf accent */}
        <g
          transform="translate(44, 20)"
          fill="none"
          strokeWidth="1"
          strokeLinecap="round"
          className="stroke-brand-sage opacity-60"
        >
          <path d="M0 6 Q4 2 6 -2" />
          <path d="M1 4 Q4 2 6 1" />
        </g>
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 340 80"
      className={className}
      role="img"
      aria-label="Tastings with Tay"
    >
      {/* Warm gold decorative dot */}
      <circle cx="16" cy="40" r="3" className="fill-brand-gold/40" />

      {/* "tastings with" — display serif, light weight, tracked small caps feel */}
      <text
        x="30"
        y="30"
        fontFamily="var(--font-display), Garamond, Georgia, serif"
        fontSize="13"
        fontWeight="300"
        letterSpacing="5"
        className="fill-brand-charcoal/60 dark:fill-brand-cream/60"
      >
        tastings with
      </text>

      {/* "Tay" — the hero, flowing script */}
      <text
        x="28"
        y="62"
        fontFamily="var(--font-script), cursive"
        fontSize="42"
        fontWeight="500"
        className="fill-brand-burgundy dark:fill-brand-gold-light"
      >
        Tay
      </text>

      {/* Decorative leaf flourish — sage green */}
      <g
        transform="translate(118, 42)"
        fill="none"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="stroke-brand-sage opacity-60 dark:opacity-50"
      >
        <path d="M0 8 Q8 4 12 -2" />
        <path d="M4 6 Q10 4 14 1" />
        <path d="M6 10 Q10 8 12 5" />
      </g>

      {/* Thin gold separator line */}
      <line
        x1="30"
        y1="72"
        x2="135"
        y2="72"
        className="stroke-brand-gold"
        strokeWidth="0.6"
        opacity="0.3"
      />
    </svg>
  )
}
