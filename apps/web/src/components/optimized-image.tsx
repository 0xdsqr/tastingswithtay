import { ImageIcon } from "lucide-react"
import { normalizeManagedImageUrl } from "../lib/image-policy"

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Skip lazy loading for above-the-fold / LCP images */
  priority?: boolean
}

/**
 * Wrapper around `<img>` that applies performance defaults:
 * - `loading="lazy"` for below-fold images (default)
 * - `loading="eager"` + `fetchPriority="high"` for priority images (LCP)
 * - `decoding="async"` to avoid blocking the main thread
 */
export function OptimizedImage({
  priority = false,
  className,
  alt,
  src,
  ...props
}: OptimizedImageProps): React.ReactElement {
  const imageSrc = normalizeManagedImageUrl(src)

  if (!imageSrc) {
    return (
      <span
        role="img"
        aria-label={alt || "Image needed"}
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className ?? ""}`}
      >
        <span className="flex flex-col items-center gap-2 px-4 text-center text-xs font-medium">
          <ImageIcon className="size-6" />
          Upload image
        </span>
      </span>
    )
  }

  return (
    <img
      src={imageSrc}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={className}
      alt={alt ?? ""}
      {...props}
    />
  )
}
