import { BookOpen } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { EmptyState } from "./empty-state"

// TODO: Replace with real blog data from the database
const posts: readonly never[] = []

export function LatestPosts(): React.ReactElement {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`mb-12 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              From the Blog
            </p>
            <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              Latest Stories
            </h2>
          </div>
        </div>

        {/* Posts Grid or Empty State */}
        <div
          className={`transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {posts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-3">
              {/* Real posts will render here */}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              heading="Stories coming soon"
              message="Tay's stories, tips, and kitchen adventures will appear here."
              variant="post"
            />
          )}
        </div>
      </div>
    </section>
  )
}
