import { BookOpen } from "lucide-react"
import { EmptyState } from "./empty-state"
import type { HomeContent } from "../lib/site-content"

const posts: readonly never[] = []

export function LatestPosts({ content }: { content: HomeContent }): React.ReactElement {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {content.storiesEyebrow}
            </p>
            <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              {content.storiesTitle}
            </h2>
          </div>
        </div>

        {/* Posts Grid or Empty State */}
        <div>
          {posts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-3">{/* Real posts will render here */}</div>
          ) : (
            <EmptyState
              icon={BookOpen}
              heading={content.storiesEmptyHeading}
              message={content.storiesEmptyBody}
              variant="post"
            />
          )}
        </div>
      </div>
    </section>
  )
}
