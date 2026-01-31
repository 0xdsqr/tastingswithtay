import { createFileRoute } from "@tanstack/react-router"
import type { GalleryImage } from "@twt/db/schema"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@twt/ui/components/dialog"
import {
  ChevronLeft,
  ChevronRight,
  Flower2,
  Egg,
  X,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { EmptyState } from "../../components/empty-state"
import { OptimizedImage } from "../../components/optimized-image"
import { SiteFooter } from "../../components/site-footer"
import { SiteHeader } from "../../components/site-header"

const categoryFilters = ["All", "Garden", "Flock"] as const

const categoryMap: Record<string, string> = {
  Garden: "garden",
  Flock: "flock",
}

export const Route = createFileRoute("/garden-and-flock/")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: (search.category as string) || undefined,
  }),
  loaderDeps: ({ search }) => ({ category: search.category }),
  loader: async ({ context, deps }) => {
    const images = (await context.queryClient.fetchQuery(
      context.trpc.gallery.list.queryOptions({
        category: deps.category,
      }),
    )) as GalleryImage[]
    return { images, activeCategory: deps.category ?? "All" }
  },
  component: GardenAndFlockPage,
})

// Lightbox component
function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  images: GalleryImage[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}): React.ReactElement {
  const image = images[currentIndex]!

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onNext()
      if (e.key === "ArrowLeft") onPrev()
      if (e.key === "Escape") onClose()
    },
    [onNext, onPrev, onClose],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] max-w-5xl gap-0 overflow-hidden border-none bg-black/95 p-0">
        <DialogTitle className="sr-only">
          {image.title ?? "Gallery image"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {image.caption ?? "Photo from the garden and flock"}
        </DialogDescription>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white/80 backdrop-blur-sm transition-colors hover:text-white"
        >
          <X className="size-5" />
        </button>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={onPrev}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 backdrop-blur-sm transition-colors hover:text-white"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 backdrop-blur-sm transition-colors hover:text-white"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}

        {/* Image */}
        <div className="flex items-center justify-center p-4">
          <img
            src={image.image}
            alt={image.title ?? "Gallery photo"}
            className="max-h-[75vh] w-auto rounded-lg object-contain"
          />
        </div>

        {/* Caption bar */}
        {(image.title || image.caption) && (
          <div className="border-t border-white/10 bg-black/80 px-6 py-4 backdrop-blur-sm">
            {image.title && (
              <h3 className="font-serif text-lg text-white">{image.title}</h3>
            )}
            {image.caption && (
              <p className="mt-1 text-sm leading-relaxed text-white/70">
                {image.caption}
              </p>
            )}
            <div className="mt-2 flex items-center justify-between text-xs text-white/40">
              <span className="capitalize">{image.category}</span>
              <span>
                {currentIndex + 1} of {images.length}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function GardenAndFlockPage(): React.ReactElement {
  const { images, activeCategory } = Route.useLoaderData()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const goNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length)
    }
  }

  const goPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-amber-50/30 to-background" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-green-400 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-amber-300 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8">
            <div className="mx-auto mb-6 flex items-center justify-center gap-3">
              <Flower2 className="h-10 w-10 text-green-600" />
              <Egg className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-balance mb-4 font-serif text-4xl text-foreground sm:text-5xl lg:text-6xl">
              Garden & Flock
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
              A peek into our little homestead. From the garden beds to the
              chicken coop — this is where the good stuff grows.
            </p>
          </div>
        </section>

        {/* Filter & Gallery */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Category Tabs */}
            <div className="mb-12 flex flex-wrap justify-center gap-3">
              {categoryFilters.map((cat) => {
                const isActive =
                  cat === "All"
                    ? activeCategory === "All"
                    : categoryMap[cat] === activeCategory
                return (
                  <a
                    key={cat}
                    href={
                      cat === "All"
                        ? "/garden-and-flock"
                        : `/garden-and-flock?category=${categoryMap[cat]}`
                    }
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat}
                  </a>
                )
              })}
            </div>

            {/* Masonry Grid */}
            {images.length > 0 ? (
              <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => openLightbox(index)}
                    className="group mb-4 block w-full break-inside-avoid text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <div className="overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                      <div className="relative overflow-hidden">
                        <OptimizedImage
                          src={image.image}
                          alt={image.title ?? "Gallery photo"}
                          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Hover overlay with caption */}
                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <div className="p-4">
                            {image.title && (
                              <p className="font-serif text-sm text-white">
                                {image.title}
                              </p>
                            )}
                            {image.caption && (
                              <p className="mt-1 line-clamp-2 text-xs text-white/80">
                                {image.caption}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Category badge */}
                        <div className="absolute left-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm ${
                              image.category === "garden"
                                ? "bg-green-500/80 text-white"
                                : "bg-amber-500/80 text-white"
                            }`}
                          >
                            {image.category === "garden"
                              ? "Garden"
                              : "Flock"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Flower2}
                heading={
                  activeCategory !== "All"
                    ? `No ${activeCategory} photos yet`
                    : "The garden is growing"
                }
                message={
                  activeCategory !== "All"
                    ? "Check back soon or try a different filter."
                    : "Photos from the garden and flock are on their way!"
                }
                variant="recipe"
              />
            )}
          </div>
        </section>
      </main>
      <SiteFooter />

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={goNext}
          onPrev={goPrev}
        />
      )}
    </div>
  )
}
