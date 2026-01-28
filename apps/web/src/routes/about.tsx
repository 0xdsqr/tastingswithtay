import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@twt/ui/components/button"
import { Instagram, Mail } from "lucide-react"
import { NewsletterSection } from "../components/newsletter-section"
import { SiteFooter } from "../components/site-footer"
import { SiteHeader } from "../components/site-header"

export const Route = createFileRoute("/about")({
  component: AboutPage,
})

function AboutPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              {/* Image */}
              <div className="relative">
                <div className="aspect-[4/5] overflow-hidden rounded-lg bg-muted">
                  <img
                    src="/warm-portrait-of-woman-cooking-in-bright-kitchen-n.jpg"
                    alt="Tay in her kitchen"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  The Story Behind the Recipes
                </p>
                <h1 className="mb-6 font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Hi, I'm Tay
                </h1>
                <div className="space-y-4 leading-relaxed text-muted-foreground">
                  <p>
                    Welcome to my corner of the internet where flour dust is a
                    fashion statement and taste-testing is considered cardio.
                    I'm so glad you're here.
                  </p>
                  <p>
                    My love affair with food started in my grandmother's
                    kitchen, where Sunday dinners were sacred and recipes were
                    passed down through generations—never written, always
                    remembered. Those memories of wooden spoons, simmering pots,
                    and the way good food brings people together shaped who I am
                    today.
                  </p>
                  <p>
                    After years of collecting recipes, experimenting in my own
                    kitchen, and sharing meals with the people I love, I finally
                    decided to share this passion with the world. Tastings with
                    Tay is my love letter to home cooking—real food, made with
                    intention, meant to be savored and shared.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="bg-secondary py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                My Philosophy
              </p>
              <h2 className="mb-8 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
                Food is love made visible
              </h2>
              <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
                <p>
                  I believe that the best meals aren't about perfection—they're
                  about presence. About slowing down, using good ingredients,
                  and cooking with care. About the conversation that happens
                  around the table and the memories we make there.
                </p>
                <p>
                  Here, you won't find overly complicated techniques or
                  impossible-to-find ingredients. My recipes are approachable,
                  tested multiple times in my own kitchen, and designed to bring
                  joy—both in the making and the eating.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Grid */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                What I Value
              </p>
              <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
                The Heart of This Kitchen
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <span className="font-serif text-2xl text-foreground">
                    01
                  </span>
                </div>
                <h3 className="mb-3 font-serif text-xl text-foreground">
                  Simplicity
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  The best dishes often have the fewest ingredients. I focus on
                  quality over quantity, letting good produce shine.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <span className="font-serif text-2xl text-foreground">
                    02
                  </span>
                </div>
                <h3 className="mb-3 font-serif text-xl text-foreground">
                  Seasonality
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Cooking with the seasons means better flavor, better
                  nutrition, and a deeper connection to what we eat.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <span className="font-serif text-2xl text-foreground">
                    03
                  </span>
                </div>
                <h3 className="mb-3 font-serif text-xl text-foreground">
                  Connection
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Food is meant to be shared. Every recipe here is designed to
                  bring people together around the table.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Image Break */}
        <section className="relative h-[50vh] lg:h-[60vh]">
          <img
            src="/beautiful-kitchen-scene-with-ingredients-and-cooki.jpg"
            alt="Cooking process in the kitchen"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <blockquote className="max-w-2xl px-6 text-center">
              <p className="font-serif text-2xl italic leading-relaxed text-primary-foreground sm:text-3xl lg:text-4xl">
                "Cooking is like love. It should be entered into with abandon or
                not at all."
              </p>
              <cite className="mt-4 block text-sm tracking-wide text-primary-foreground/80">
                — Harriet Van Horne
              </cite>
            </blockquote>
          </div>
        </section>

        {/* What You'll Find Section */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              <div>
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  What You'll Find Here
                </p>
                <h2 className="mb-6 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
                  More Than Just Recipes
                </h2>
                <div className="space-y-4 leading-relaxed text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Recipes:</strong> From
                    quick weeknight dinners to weekend baking projects, each
                    recipe is thoroughly tested and written with detailed
                    instructions so you can recreate them with confidence.
                  </p>
                  <p>
                    <strong className="text-foreground">Kitchen Tips:</strong>{" "}
                    Little tricks and techniques I've learned along the way that
                    make cooking easier and more enjoyable.
                  </p>
                  <p>
                    <strong className="text-foreground">Life & Stories:</strong>{" "}
                    Because food is about more than just eating—it's about the
                    stories we tell, the traditions we keep, and the moments we
                    share.
                  </p>
                  <p>
                    <strong className="text-foreground">The Shop:</strong> A
                    curated collection of kitchen essentials I genuinely love
                    and use in my own kitchen every day.
                  </p>
                </div>
                <div className="mt-8">
                  <Button asChild>
                    <a href="/recipes">Explore Recipes</a>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                  <img
                    src="/overhead-shot-of-colorful-ingredients-on-cutting-.jpg"
                    alt="Fresh ingredients on a cutting board"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Connect Section */}
        <section className="bg-secondary py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Let's Connect
              </p>
              <h2 className="mb-6 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
                I'd Love to Hear From You
              </h2>
              <p className="mb-8 leading-relaxed text-muted-foreground">
                Whether you have a question about a recipe, want to share how a
                dish turned out, or just want to say hello—my inbox is always
                open. You can also follow along on Instagram for
                behind-the-scenes kitchen moments.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button variant="outline" size="lg" asChild>
                  <a href="mailto:hello@tastingswithtay.com">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Me
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a
                    href="https://instagram.com/tastingswithtay"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="mr-2 h-4 w-4" />
                    Follow Along
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <NewsletterSection />
      </main>
      <SiteFooter />
    </div>
  )
}
