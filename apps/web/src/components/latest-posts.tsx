import { ArrowRight, Heart, MessageCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const posts = [
  {
    title: "My Journey with Sourdough",
    excerpt:
      "How I fell in love with the art of slow bread making and what it taught me about patience.",
    image: "/artisan-sourdough-bread-loaf-with-crispy-golden-cr.jpg",
    category: "Life",
    likes: 234,
    comments: 45,
    slug: "my-journey-with-sourdough",
  },
  {
    title: "Spring Farmers Market Finds",
    excerpt:
      "A peek into my weekly market ritual and the treasures I brought home this week.",
    image: "/seasonal-harvest-vegetables-and-fruits-arrangement.jpg",
    category: "Lifestyle",
    likes: 189,
    comments: 32,
    slug: "spring-farmers-market-finds",
  },
  {
    title: "Kitchen Tools I Can't Live Without",
    excerpt:
      "The essential items that make my cooking life easier every single day.",
    image: "/elegant-cream-ceramic-mixing-bowls-stacked-kitchen.jpg",
    category: "Tips",
    likes: 312,
    comments: 67,
    slug: "kitchen-tools-i-cant-live-without",
  },
] as const

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
          className={`mb-12 flex flex-col gap-4 transition-all duration-700 sm:flex-row sm:items-end sm:justify-between ${
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
          <a
            href="/blog"
            className="group inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Read more stories
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {posts.map((post, index) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`group transition-all duration-700 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{
                transitionDelay: isVisible ? `${(index + 1) * 100}ms` : "0ms",
              }}
            >
              <article className="flex h-full flex-col">
                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4">
                    <span className="inline-block rounded-full bg-background/90 px-3 py-1 text-xs font-medium tracking-wide text-foreground backdrop-blur-sm">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col">
                  <h3 className="text-balance mb-2 font-serif text-xl text-foreground transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {post.comments}
                    </span>
                  </div>
                </div>
              </article>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
