export type SiteDraft = {
  home: {
    heroFallbackEyebrow: string
    heroFallbackTitle: string
    heroFallbackBody: string
    primaryCtaLabel: string
    primaryCtaHref: string
    secondaryCtaLabel: string
    secondaryCtaHref: string
    bentoEyebrow: string
    bentoTitle: string
    storiesEyebrow: string
    storiesTitle: string
    storiesEmptyHeading: string
    storiesEmptyBody: string
  }
  about: {
    heroEyebrow: string
    heroTitle: string
    heroImage: string
    introBody: string
    philosophyEyebrow: string
    philosophyTitle: string
    philosophyBody: string
    valuesEyebrow: string
    valuesTitle: string
    values: Array<{ id: string; title: string; body: string }>
    quoteText: string
    quoteAuthor: string
    quoteImage: string
    whatsIncludedEyebrow: string
    whatsIncludedTitle: string
    whatsIncludedBody: string
    whatsIncludedImage: string
    connectEyebrow: string
    connectTitle: string
    connectBody: string
  }
  newsletter: {
    eyebrow: string
    title: string
    body: string
    privacyNote: string
  }
  gardenAndFlock: {
    metaTitle: string
    metaDescription: string
    heroTitle: string
    heroBody: string
    allFilterLabel: string
    gardenFilterLabel: string
    flockFilterLabel: string
    emptyAllHeading: string
    emptyAllBody: string
    emptyGardenHeading: string
    emptyGardenBody: string
    emptyFlockHeading: string
    emptyFlockBody: string
  }
}

const defaultAboutHeroImageUrl = "/about/taylor_and_dave_about.jpg"

export const defaultSiteDraft: SiteDraft = {
  home: {
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
  },
  about: {
    heroEyebrow: "The Story Behind the Recipes",
    heroTitle: "Hi, I'm Tay",
    heroImage: defaultAboutHeroImageUrl,
    introBody:
      "Welcome to my corner of the internet where flour dust is a fashion statement and taste-testing is considered cardio. I'm so glad you're here.\n\nMy love affair with food started in my grandmother's kitchen, where Sunday dinners were sacred and recipes were passed down through generations.\n\nTastings with Tay is my love letter to home cooking — real food, made with intention, meant to be savored and shared.",
    philosophyEyebrow: "My Philosophy",
    philosophyTitle: "Food is love made visible",
    philosophyBody:
      "I believe that the best meals aren't about perfection — they're about presence.\n\nHere, you won't find overly complicated techniques or impossible-to-find ingredients. My recipes are approachable, tested multiple times in my own kitchen, and designed to bring joy.",
    valuesEyebrow: "What I Value",
    valuesTitle: "The Heart of This Kitchen",
    values: [
      {
        id: "simplicity",
        title: "Simplicity",
        body: "The best dishes often have the fewest ingredients.",
      },
      {
        id: "seasonality",
        title: "Seasonality",
        body: "Cooking with the seasons means better flavor and a deeper connection to what we eat.",
      },
      {
        id: "connection",
        title: "Connection",
        body: "Food is meant to be shared. Every recipe here is designed to bring people together.",
      },
    ],
    quoteText: '"Cooking is like love. It should be entered into with abandon or not at all."',
    quoteAuthor: "Harriet Van Horne",
    quoteImage: "",
    whatsIncludedEyebrow: "What You'll Find Here",
    whatsIncludedTitle: "More Than Just Recipes",
    whatsIncludedBody:
      "Recipes: from quick weeknight dinners to weekend baking projects.\nKitchen Tips: little tricks and techniques that make cooking easier.\nLife & Stories: the traditions, moments, and rituals around the table.",
    whatsIncludedImage: "",
    connectEyebrow: "Let's Connect",
    connectTitle: "I'd Love to Hear From You",
    connectBody:
      "Whether you have a question about a recipe, want to share how a dish turned out, or just want to say hello — my inbox is always open.",
  },
  newsletter: {
    eyebrow: "Stay Connected",
    title: "Join the Table",
    body: "Get weekly recipes, cooking tips, and new notes from Tay delivered straight to your inbox.",
    privacyNote: "No spam, unsubscribe anytime.",
  },
  gardenAndFlock: {
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
  },
}

export function mergeSiteDraft(value: Partial<SiteDraft> | null | undefined): SiteDraft {
  const about = (value?.about ?? {}) as Partial<SiteDraft["about"]>
  const managedImageValue = (imageValue: string | undefined, defaultValue: string): string =>
    imageValue?.trim() || defaultValue

  return {
    home: {
      ...defaultSiteDraft.home,
      ...(value?.home ?? {}),
    },
    about: {
      ...defaultSiteDraft.about,
      ...about,
      heroImage: managedImageValue(about.heroImage, defaultSiteDraft.about.heroImage),
      quoteImage: managedImageValue(about.quoteImage, defaultSiteDraft.about.quoteImage),
      whatsIncludedImage: managedImageValue(
        about.whatsIncludedImage,
        defaultSiteDraft.about.whatsIncludedImage,
      ),
      values:
        value?.about?.values && value.about.values.length > 0
          ? value.about.values
          : defaultSiteDraft.about.values,
    },
    newsletter: {
      ...defaultSiteDraft.newsletter,
      ...(value?.newsletter ?? {}),
    },
    gardenAndFlock: {
      ...defaultSiteDraft.gardenAndFlock,
      ...(value?.gardenAndFlock ?? {}),
    },
  }
}
