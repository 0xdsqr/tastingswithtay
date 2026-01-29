interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
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
  ...props
}: OptimizedImageProps): React.ReactElement {
  return (
    <img
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={className}
      alt={alt ?? ""}
      {...props}
    />
  )
}
