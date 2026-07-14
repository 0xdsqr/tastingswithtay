import { z } from "zod"

const localHref = z.string().regex(/^\/(?!\/)/)

const homeContentSchema = z.object({
  heroFallbackEyebrow: z.string(),
  heroFallbackTitle: z.string(),
  heroFallbackBody: z.string(),
  primaryCtaLabel: z.string(),
  primaryCtaHref: localHref,
  secondaryCtaLabel: z.string(),
  secondaryCtaHref: localHref,
  bentoEyebrow: z.string(),
  bentoTitle: z.string(),
  storiesEyebrow: z.string(),
  storiesTitle: z.string(),
  storiesEmptyHeading: z.string(),
  storiesEmptyBody: z.string(),
})

const newsletterContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  body: z.string(),
  privacyNote: z.string(),
})

const gardenAndFlockContentSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  heroTitle: z.string(),
  heroBody: z.string(),
  allFilterLabel: z.string(),
  gardenFilterLabel: z.string(),
  flockFilterLabel: z.string(),
  emptyAllHeading: z.string(),
  emptyAllBody: z.string(),
  emptyGardenHeading: z.string(),
  emptyGardenBody: z.string(),
  emptyFlockHeading: z.string(),
  emptyFlockBody: z.string(),
})

export type HomeContent = z.infer<typeof homeContentSchema>
export type NewsletterContent = z.infer<typeof newsletterContentSchema>
export type GardenAndFlockContent = z.infer<typeof gardenAndFlockContentSchema>

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

function sectionFrom(value: unknown, section: "home" | "newsletter" | "gardenAndFlock"): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined
  return (value as Record<string, unknown>)[section]
}

export function getHomeContent(value: unknown): HomeContent {
  const parsed = homeContentSchema.safeParse(sectionFrom(value, "home"))
  return parsed.success ? parsed.data : defaultHomeContent
}

export function getNewsletterContent(value: unknown): NewsletterContent {
  const parsed = newsletterContentSchema.safeParse(sectionFrom(value, "newsletter"))
  return parsed.success ? parsed.data : defaultNewsletterContent
}

export function getGardenAndFlockContent(value: unknown): GardenAndFlockContent {
  const parsed = gardenAndFlockContentSchema.safeParse(sectionFrom(value, "gardenAndFlock"))
  return parsed.success ? parsed.data : defaultGardenAndFlockContent
}
