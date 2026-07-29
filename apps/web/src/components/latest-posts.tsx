import { SectionHeader } from "@twt/react/components/section-header"
import { BookOpen } from "lucide-react"
import { EmptyState } from "./empty-state"
import type { HomeContent } from "../lib/site-content"

const posts: readonly never[] = []

export function LatestPosts({ content }: { content: HomeContent }): React.ReactElement {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          className="mb-12"
          eyebrow={content.storiesEyebrow}
          title={content.storiesTitle}
        />

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
