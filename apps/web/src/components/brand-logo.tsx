interface BrandLogoProps {
  className?: string
  variant?: "logo" | "avatar" | "editorial" | "seal" | "script"
  loading?: "eager" | "lazy"
  sizes?: string
}

const imageVariants = {
  editorial: {
    alt: "Tastings with Tay",
    height: 305,
    src: "/brand/tastings-with-tay-editorial-768.png",
    srcSet:
      "/brand/tastings-with-tay-editorial-384.png 384w, /brand/tastings-with-tay-editorial-768.png 768w",
    width: 768,
  },
  seal: {
    alt: "Tastings with Tay",
    height: 668,
    src: "/brand/tastings-with-tay-seal-640.png",
    srcSet:
      "/brand/tastings-with-tay-seal-320.png 320w, /brand/tastings-with-tay-seal-640.png 640w",
    width: 640,
  },
  script: {
    alt: "Tastings with Tay",
    height: 544,
    src: "/brand/tastings-with-tay-script-960.png",
    srcSet:
      "/brand/tastings-with-tay-script-480.png 480w, /brand/tastings-with-tay-script-960.png 960w",
    width: 960,
  },
} as const

export function BrandLogo({
  className = "",
  variant = "logo",
  loading = "lazy",
  sizes,
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

  if (variant === "editorial" || variant === "seal" || variant === "script") {
    const image = imageVariants[variant]

    return (
      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={image.alt}
        loading={loading}
        decoding="async"
        className={`block h-auto object-contain ${className}`}
      />
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
