import { Option, Predicate, Schema } from "effect"

const localHref = Schema.String.check(Schema.isPattern(/^\/(?!\/)/))

const homeContentSchema = Schema.Struct({
  heroFallbackEyebrow: Schema.String,
  heroFallbackTitle: Schema.String,
  heroFallbackBody: Schema.String,
  primaryCtaLabel: Schema.String,
  primaryCtaHref: localHref,
  secondaryCtaLabel: Schema.String,
  secondaryCtaHref: localHref,
  bentoEyebrow: Schema.String,
  bentoTitle: Schema.String,
  storiesEyebrow: Schema.String,
  storiesTitle: Schema.String,
  storiesEmptyHeading: Schema.String,
  storiesEmptyBody: Schema.String,
})

const newsletterContentSchema = Schema.Struct({
  eyebrow: Schema.String,
  title: Schema.String,
  body: Schema.String,
  privacyNote: Schema.String,
})

const gardenAndFlockContentSchema = Schema.Struct({
  metaTitle: Schema.String,
  metaDescription: Schema.String,
  heroTitle: Schema.String,
  heroBody: Schema.String,
  allFilterLabel: Schema.String,
  gardenFilterLabel: Schema.String,
  flockFilterLabel: Schema.String,
  emptyAllHeading: Schema.String,
  emptyAllBody: Schema.String,
  emptyGardenHeading: Schema.String,
  emptyGardenBody: Schema.String,
  emptyFlockHeading: Schema.String,
  emptyFlockBody: Schema.String,
})

export type HomeContent = typeof homeContentSchema.Type
export type NewsletterContent = typeof newsletterContentSchema.Type
export type GardenAndFlockContent = typeof gardenAndFlockContentSchema.Type

const defaultHomeContent: HomeContent = {
  heroFallbackEyebrow: "Welcome to",
  heroFallbackTitle: "Tastings with Tay",
  heroFallbackBody: "Recipes, wine tastings, and kitchen stories are on their way. Stay tuned!",
  primaryCtaLabel: "Learn More About Tay",
  primaryCtaHref: "/about",
  secondaryCtaLabel: "Browse All Recipes",
  secondaryCtaHref: "/recipes",
  bentoEyebrow: "Discover",
  bentoTitle: "What's Cooking",
  storiesEyebrow: "From the Blog",
  storiesTitle: "Latest Stories",
  storiesEmptyHeading: "Stories coming soon",
  storiesEmptyBody: "Tay's stories, tips, and kitchen adventures will appear here.",
}

const defaultNewsletterContent: NewsletterContent = {
  eyebrow: "Stay Connected",
  title: "Join the Table",
  body: "Get weekly recipes, cooking tips, and new notes from Tay delivered straight to your inbox.",
  privacyNote: "No spam, unsubscribe anytime.",
}

const defaultGardenAndFlockContent: GardenAndFlockContent = {
  metaTitle: "Garden & Flock | Tastings with Tay",
  metaDescription: "Photos and stories from Tay's garden beds, seasonal harvests, and flock.",
  heroTitle: "Garden & Flock",
  heroBody:
    "A peek into our little homestead. From the garden beds to the chicken coop — this is where the good stuff grows.",
  allFilterLabel: "All",
  gardenFilterLabel: "Garden",
  flockFilterLabel: "Flock",
  emptyAllHeading: "The garden is growing",
  emptyAllBody: "Photos from the garden and flock are on their way!",
  emptyGardenHeading: "No garden photos yet",
  emptyGardenBody: "Check back soon or try a different filter.",
  emptyFlockHeading: "No flock photos yet",
  emptyFlockBody: "Check back soon or try a different filter.",
}

const sectionFrom = (value: unknown, section: "home" | "newsletter" | "gardenAndFlock"): unknown =>
  Predicate.isObject(value) ? (value as Record<string, unknown>)[section] : undefined

/** Decodes one section of the published site copy, falling back to built-in copy when it is absent or incomplete. */
const sectionOr =
  <A>(schema: Schema.Codec<A>, section: Parameters<typeof sectionFrom>[1], fallback: A) =>
  (value: unknown): A =>
    Option.getOrElse(
      Schema.decodeUnknownOption(schema)(sectionFrom(value, section)),
      () => fallback,
    )

export const getHomeContent = sectionOr(homeContentSchema, "home", defaultHomeContent)

export const getNewsletterContent = sectionOr(
  newsletterContentSchema,
  "newsletter",
  defaultNewsletterContent,
)

export const getGardenAndFlockContent = sectionOr(
  gardenAndFlockContentSchema,
  "gardenAndFlock",
  defaultGardenAndFlockContent,
)
