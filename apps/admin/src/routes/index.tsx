import { createFileRoute, redirect } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback } from "@twt/ui/components/avatar"
import { Badge } from "@twt/ui/components/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@twt/ui/components/breadcrumb"
import { Button } from "@twt/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@twt/ui/components/card"
import { Input } from "@twt/ui/components/input"
import { Label } from "@twt/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@twt/ui/components/select"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@twt/ui/components/sidebar"
import { Spinner } from "@twt/ui/components/spinner"
import { Switch } from "@twt/ui/components/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@twt/ui/components/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@twt/ui/components/tabs"
import { Textarea } from "@twt/ui/components/textarea"
import type { Experiment, ExperimentEntry, GalleryImage, Recipe, Wine } from "@twt/db/schema"
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react"
import { authClient } from "../auth/client"
import { getAdminSessionUser } from "../lib/admin-access"
import {
  type ManagedAssetFolder,
  type ManagedImageAsset,
  deleteManagedAsset,
  listManagedAssets,
  uploadManagedAsset,
} from "../lib/admin-assets"
import {
  type AdminUserRecord,
  createEmptyExperiment,
  createEmptyExperimentEntry,
  createEmptyGalleryImage,
  createEmptyRecipe,
  createEmptyWine,
  deleteRecord,
  formatAdminDate,
  getAdminBootstrap,
  mapExperimentToForm,
  mapGalleryToForm,
  mapRecipeToForm,
  mapWineToForm,
  publishSiteDraft,
  saveExperiment,
  saveGalleryImage,
  saveRecipe,
  saveSiteDraft,
  saveWine,
  updateAdminUserRole,
} from "../lib/admin-data"

type SectionId = "dashboard" | "content" | "users"
type ContentSectionId =
  | "site"
  | "images"
  | "recipes"
  | "wines"
  | "experiments"
  | "gallery"
  | "taxonomy"
type ManagedRole = "admin" | "user"
type ExperimentWithEntries = Experiment & { entries: ExperimentEntry[] }
type RecipeForm = ReturnType<typeof createEmptyRecipe> & { id?: string }
type WineForm = ReturnType<typeof createEmptyWine> & { id?: string }
type ExperimentForm = ReturnType<typeof createEmptyExperiment> & { id?: string }
type GalleryForm = ReturnType<typeof createEmptyGalleryImage> & { id?: string }

const difficultyOptions = ["Easy", "Medium", "Hard"] as const
const wineTypeOptions = ["Red", "White", "Rosé", "Sparkling", "Dessert"] as const
const priceRangeOptions = ["$", "$$", "$$$", "$$$$", "$$$$$"] as const
const experimentStatusOptions = ["in_progress", "paused", "completed", "graduated"] as const
const experimentEntryTypeOptions = ["update", "photo", "note", "result", "iteration"] as const
const galleryCategoryOptions = ["garden", "flock"] as const
const tagTypeOptions = ["recipe", "wine", "experiment", "both"] as const
const managedAssetFolderOptions = [
  "about",
  "recipes",
  "wines",
  "experiments",
  "gallery",
  "brand",
  "system",
  "uploads",
] as const satisfies readonly ManagedAssetFolder[]

const managedImagePrefixes = managedAssetFolderOptions.map((folder) => `/${folder}/`)
const maxImageUploadBytes = 10 * 1024 * 1024
const maxImageUploadEdge = 2400
const compressedImageQuality = 0.88
const managedImageProxyPrefix = "/api/images/"
const managedImageHosts = new Set([
  "admin.tastingswithtay.com",
  "cdn.dsqr.dev",
  "s3.dsqr.dev",
  "tastingswithtay.com",
])
const defaultAboutHeroImageUrl = "/about/taylor_and_dave_about.jpg"

type SiteDraft = {
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
}

type TaxonomyDraft = {
  tags: Array<{
    id: string
    name: string
    type: (typeof tagTypeOptions)[number]
  }>
  collections: Array<{
    id: string
    name: string
    description: string
    featured: boolean
  }>
  pairings: Array<{
    id: string
    recipeId: string
    wineId: string
    note: string
    isPrimary: boolean
  }>
  notes: string
}

const defaultSiteDraft: SiteDraft = {
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
}

const defaultTaxonomyDraft: TaxonomyDraft = {
  tags: [
    { id: "tag-1", name: "Weeknight", type: "recipe" },
    { id: "tag-2", name: "Celebration", type: "wine" },
    { id: "tag-3", name: "Seasonal", type: "both" },
  ],
  collections: [
    {
      id: "collection-1",
      name: "Sunday Suppers",
      description: "A warm, family-style set of recipes and pairings for long table evenings.",
      featured: true,
    },
  ],
  pairings: [],
  notes:
    "Use this area to sketch tags, collections, and featured pairings before we wire the final database relationships.",
}

export const Route = createFileRoute("/")({
  loader: async () => {
    const adminUser = await getAdminSessionUser()
    if (!adminUser) {
      throw redirect({ to: "/login" })
    }

    return getAdminBootstrap()
  },
  component: AdminPortalPage,
})

function AdminPortalPage(): React.ReactElement {
  const bootstrap = Route.useLoaderData()
  const [activeSection, setActiveSection] = useState<SectionId>("content")
  const [contentSection, setContentSection] = useState<ContentSectionId>("site")
  const [users, setUsers] = useState<AdminUserRecord[]>(bootstrap.users)
  const [recipes, setRecipes] = useState<Recipe[]>(bootstrap.recipes as Recipe[])
  const [wines, setWines] = useState<Wine[]>(bootstrap.wines as Wine[])
  const [experiments, setExperiments] = useState<ExperimentWithEntries[]>(
    bootstrap.experiments as ExperimentWithEntries[],
  )
  const [gallery, setGallery] = useState<GalleryImage[]>(bootstrap.gallery as GalleryImage[])
  const [siteDraft, setSiteDraft] = useState<SiteDraft>(
    mergeSiteDraft(bootstrap.siteDraft as Partial<SiteDraft> | null),
  )
  const [taxonomyDraft, setTaxonomyDraft, taxonomyDraftHydrated] =
    useLocalStorageDraft<TaxonomyDraft>("twt-admin-taxonomy-draft", defaultTaxonomyDraft)
  const [signingOut, startSignOutTransition] = useTransition()

  const adminCount = users.filter((user) => toManagedRole(user.role) === "admin").length
  const publishedCount =
    recipes.filter((item) => item.published).length +
    wines.filter((item) => item.published).length +
    experiments.filter((item) => item.published).length +
    gallery.filter((item) => item.published).length

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="gap-1 p-4">
          <div className="text-sm font-semibold">Tastings with Tay</div>
          <div className="text-xs text-muted-foreground">Admin portal</div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeSection === "dashboard"}
                    onClick={() => setActiveSection("dashboard")}
                    tooltip="Dashboard"
                  >
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeSection === "content"}
                    onClick={() => setActiveSection("content")}
                    tooltip="Content"
                  >
                    <span>Content</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeSection === "users"}
                    onClick={() => setActiveSection("users")}
                    tooltip="Users"
                  >
                    <span>Users</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {initialsFor(bootstrap.user.name || bootstrap.user.email || "A")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {bootstrap.user.name || bootstrap.user.email}
              </div>
              <div className="truncate text-xs text-muted-foreground">{bootstrap.user.email}</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            disabled={signingOut}
            onClick={() => {
              startSignOutTransition(async () => {
                await authClient.signOut()
                window.location.href = "/login"
              })
            }}
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
          <header className="flex flex-col gap-4 border-b pb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="md:hidden" />
                <div className="min-w-0">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbPage>Admin</BreadcrumbPage>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {activeSection === "dashboard"
                            ? "Dashboard"
                            : activeSection === "content"
                              ? "Content"
                              : "Users"}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                  <h1 className="mt-2 truncate text-xl font-semibold tracking-tight sm:text-2xl">
                    {activeSection === "dashboard"
                      ? "Dashboard"
                      : activeSection === "content"
                        ? "Content studio"
                        : "Users"}
                  </h1>
                  <p className="max-w-3xl text-sm text-muted-foreground">
                    {activeSection === "dashboard"
                      ? "A quick read on what exists, what is live, and how the admin is organized."
                      : activeSection === "content"
                        ? "One workspace for site copy, recipes, wines, experiments, gallery, and taxonomy planning."
                        : "Manage accounts and who can access the admin portal."}
                  </p>
                </div>
              </div>

              <Badge variant="secondary" className="hidden sm:inline-flex">
                {bootstrap.user.role || "admin"}
              </Badge>
            </div>

            <Tabs
              value={activeSection}
              onValueChange={(value) => setActiveSection(value as SectionId)}
              className="md:hidden"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>
            </Tabs>
          </header>

          {activeSection === "dashboard" ? (
            <DashboardPanel
              totalUsers={users.length}
              adminCount={adminCount}
              publishedCount={publishedCount}
              recipeCount={recipes.length}
              wineCount={wines.length}
              experimentCount={experiments.length}
              galleryCount={gallery.length}
            />
          ) : null}

          {activeSection === "content" ? (
            <ContentStudio
              contentSection={contentSection}
              onContentSectionChange={setContentSection}
              recipes={recipes}
              wines={wines}
              experiments={experiments}
              gallery={gallery}
              onRecipesChange={setRecipes}
              onWinesChange={setWines}
              onExperimentsChange={setExperiments}
              onGalleryChange={setGallery}
              siteDraft={siteDraft}
              setSiteDraft={setSiteDraft}
              siteDraftHydrated
              taxonomyDraft={taxonomyDraft}
              setTaxonomyDraft={setTaxonomyDraft}
              taxonomyDraftHydrated={taxonomyDraftHydrated}
            />
          ) : null}

          {activeSection === "users" ? (
            <UsersPanel
              users={users}
              currentUserId={bootstrap.user.id ?? ""}
              onUsersChange={setUsers}
            />
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function DashboardPanel({
  totalUsers,
  adminCount,
  publishedCount,
  recipeCount,
  wineCount,
  experimentCount,
  galleryCount,
}: {
  totalUsers: number
  adminCount: number
  publishedCount: number
  recipeCount: number
  wineCount: number
  experimentCount: number
  galleryCount: number
}): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Users" value={String(totalUsers)} description="All site accounts" />
        <SummaryCard title="Admins" value={String(adminCount)} description="Can access admin" />
        <SummaryCard
          title="Published records"
          value={String(publishedCount)}
          description="Live recipes, wines, experiments, and gallery images"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>How the content studio is organized</CardTitle>
            <CardDescription>
              The cleanest experience for a non-technical editor is to separate page copy from
              structured content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <InfoRow
              title="Site copy"
              body="Homepage and About page storytelling live in saved draft forms. The public About page reads from the saved Site tab content."
            />
            <InfoRow
              title="Structured content"
              body="Recipes, wines, test-kitchen entries, and garden/flock images use the real schema-backed forms so Tay can already add, edit, delete, and publish those."
            />
            <InfoRow
              title="Taxonomy planning"
              body="Tags, collections, and pairings are drafted in one place first. Once the exact relationships feel right, we wire those into the database and public site."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What exists in the database today</CardTitle>
            <CardDescription>
              These are the live structured content areas already represented in the schema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <KeyValueRow label="Recipes" value={String(recipeCount)} />
            <KeyValueRow label="Wines" value={String(wineCount)} />
            <KeyValueRow label="Experiments" value={String(experimentCount)} />
            <KeyValueRow label="Gallery images" value={String(galleryCount)} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ContentStudio({
  contentSection,
  onContentSectionChange,
  recipes,
  wines,
  experiments,
  gallery,
  onRecipesChange,
  onWinesChange,
  onExperimentsChange,
  onGalleryChange,
  siteDraft,
  setSiteDraft,
  siteDraftHydrated,
  taxonomyDraft,
  setTaxonomyDraft,
  taxonomyDraftHydrated,
}: {
  contentSection: ContentSectionId
  onContentSectionChange: (value: ContentSectionId) => void
  recipes: Recipe[]
  wines: Wine[]
  experiments: ExperimentWithEntries[]
  gallery: GalleryImage[]
  onRecipesChange: (value: Recipe[]) => void
  onWinesChange: (value: Wine[]) => void
  onExperimentsChange: (value: ExperimentWithEntries[]) => void
  onGalleryChange: (value: GalleryImage[]) => void
  siteDraft: SiteDraft
  setSiteDraft: React.Dispatch<React.SetStateAction<SiteDraft>>
  siteDraftHydrated: boolean
  taxonomyDraft: TaxonomyDraft
  setTaxonomyDraft: React.Dispatch<React.SetStateAction<TaxonomyDraft>>
  taxonomyDraftHydrated: boolean
}): React.ReactElement {
  return (
    <div className="space-y-6">
      <Tabs
        value={contentSection}
        onValueChange={(value) => onContentSectionChange(value as ContentSectionId)}
      >
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 md:grid-cols-4 xl:grid-cols-7">
          <ContentTab value="site" label="Site" draft />
          <ContentTab value="images" label="Images" />
          <ContentTab value="recipes" label="Recipes" />
          <ContentTab value="wines" label="Wines" />
          <ContentTab value="experiments" label="Test Kitchen" />
          <ContentTab value="gallery" label="Gallery" />
          <ContentTab value="taxonomy" label="Taxonomy" draft />
        </TabsList>
      </Tabs>

      {contentSection === "site" ? (
        <SiteContentManager
          draft={siteDraft}
          setDraft={setSiteDraft}
          hydrated={siteDraftHydrated}
          recipeCount={recipes.filter((recipe) => recipe.featured).length}
        />
      ) : null}

      {contentSection === "images" ? <ImageManager /> : null}

      {contentSection === "recipes" ? (
        <RecipeManager items={recipes} onItemsChange={onRecipesChange} />
      ) : null}

      {contentSection === "wines" ? (
        <WineManager items={wines} onItemsChange={onWinesChange} />
      ) : null}

      {contentSection === "experiments" ? (
        <ExperimentManager
          items={experiments}
          recipes={recipes}
          onItemsChange={onExperimentsChange}
        />
      ) : null}

      {contentSection === "gallery" ? (
        <GalleryManager items={gallery} onItemsChange={onGalleryChange} />
      ) : null}

      {contentSection === "taxonomy" ? (
        <TaxonomyManager
          draft={taxonomyDraft}
          setDraft={setTaxonomyDraft}
          hydrated={taxonomyDraftHydrated}
          recipes={recipes}
          wines={wines}
        />
      ) : null}
    </div>
  )
}

function SiteContentManager({
  draft,
  setDraft,
  hydrated,
  recipeCount,
}: {
  draft: SiteDraft
  setDraft: React.Dispatch<React.SetStateAction<SiteDraft>>
  hydrated: boolean
  recipeCount: number
}): React.ReactElement {
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!hydrated) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-10 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          Loading site draft...
        </CardContent>
      </Card>
    )
  }

  const saveDraft = () => {
    setMessage(null)
    startTransition(async () => {
      try {
        await saveSiteDraft({ data: { draft } })
        setMessage("Site draft saved. Publish it when the changes are ready for visitors.")
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not save site draft.")
      }
    })
  }

  const publishDraft = () => {
    setMessage(null)
    startTransition(async () => {
      try {
        await saveSiteDraft({ data: { draft } })
        await publishSiteDraft()
        setMessage("Site changes published.")
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not publish site changes.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site pages and storytelling</CardTitle>
          <CardDescription>
            This area controls page copy, section images, and story-led content for the public site.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <InfoRow
            title="Homepage hero"
            body={`The rotating homepage hero already uses featured recipes. Right now ${recipeCount} recipe${recipeCount === 1 ? "" : "s"} are marked featured.`}
          />
          <InfoRow
            title="About page"
            body="The public About page reads the saved hero image, story, philosophy, values, quote, and connection copy from here."
          />
          <InfoRow
            title="Images"
            body="Upload through the Images tab or directly from image fields. URLs are written from the tastingswithtay RustFS bucket."
          />
        </CardContent>
      </Card>

      {message ? (
        <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">{message}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Homepage copy</CardTitle>
            <CardDescription>Fallback messaging and section copy for the homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="Fallback eyebrow">
              <Input
                value={draft.home.heroFallbackEyebrow}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    home: { ...current.home, heroFallbackEyebrow: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Fallback title">
              <Input
                value={draft.home.heroFallbackTitle}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    home: { ...current.home, heroFallbackTitle: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Fallback body">
              <Textarea
                rows={4}
                value={draft.home.heroFallbackBody}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    home: { ...current.home, heroFallbackBody: event.target.value },
                  }))
                }
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Primary CTA label">
                <Input
                  value={draft.home.primaryCtaLabel}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, primaryCtaLabel: event.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Primary CTA href">
                <Input
                  value={draft.home.primaryCtaHref}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, primaryCtaHref: event.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Secondary CTA label">
                <Input
                  value={draft.home.secondaryCtaLabel}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, secondaryCtaLabel: event.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Secondary CTA href">
                <Input
                  value={draft.home.secondaryCtaHref}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, secondaryCtaHref: event.target.value },
                    }))
                  }
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Bento eyebrow">
                <Input
                  value={draft.home.bentoEyebrow}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, bentoEyebrow: event.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Bento title">
                <Input
                  value={draft.home.bentoTitle}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, bentoTitle: event.target.value },
                    }))
                  }
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Stories eyebrow">
                <Input
                  value={draft.home.storiesEyebrow}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, storiesEyebrow: event.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Stories title">
                <Input
                  value={draft.home.storiesTitle}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      home: { ...current.home, storiesTitle: event.target.value },
                    }))
                  }
                />
              </Field>
            </div>
            <Field label="Empty-state heading">
              <Input
                value={draft.home.storiesEmptyHeading}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    home: { ...current.home, storiesEmptyHeading: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Empty-state body">
              <Textarea
                rows={3}
                value={draft.home.storiesEmptyBody}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    home: { ...current.home, storiesEmptyBody: event.target.value },
                  }))
                }
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About page and newsletter</CardTitle>
            <CardDescription>
              This is the long-form storytelling area for Tay&apos;s voice and page sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="About eyebrow">
              <Input
                value={draft.about.heroEyebrow}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, heroEyebrow: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="About title">
              <Input
                value={draft.about.heroTitle}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, heroTitle: event.target.value },
                  }))
                }
              />
            </Field>
            <ImageUploadField
              label="About hero image"
              value={draft.about.heroImage}
              folder="about"
              description="Use this for Tay's main portrait. Upload once, preview it here, then save the draft."
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  about: { ...current.about, heroImage: value },
                }))
              }
            />
            <Field label="Intro story">
              <Textarea
                rows={8}
                value={draft.about.introBody}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, introBody: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Philosophy title">
              <Input
                value={draft.about.philosophyTitle}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, philosophyTitle: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Philosophy body">
              <Textarea
                rows={5}
                value={draft.about.philosophyBody}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, philosophyBody: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Values section title">
              <Input
                value={draft.about.valuesTitle}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, valuesTitle: event.target.value },
                  }))
                }
              />
            </Field>
            <div className="space-y-3">
              <Label>Values cards</Label>
              {draft.about.values.map((item, index) => (
                <div key={item.id} className="rounded-md border p-3">
                  <div className="mb-3 text-xs text-muted-foreground">Card {index + 1}</div>
                  <div className="grid gap-3">
                    <Input
                      value={item.title}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          about: {
                            ...current.about,
                            values: current.about.values.map((value) =>
                              value.id === item.id
                                ? { ...value, title: event.target.value }
                                : value,
                            ),
                          },
                        }))
                      }
                      placeholder="Title"
                    />
                    <Textarea
                      rows={3}
                      value={item.body}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          about: {
                            ...current.about,
                            values: current.about.values.map((value) =>
                              value.id === item.id ? { ...value, body: event.target.value } : value,
                            ),
                          },
                        }))
                      }
                      placeholder="Body"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Quote text">
                <Textarea
                  rows={4}
                  value={draft.about.quoteText}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      about: { ...current.about, quoteText: event.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Quote author">
                <Input
                  value={draft.about.quoteAuthor}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      about: { ...current.about, quoteAuthor: event.target.value },
                    }))
                  }
                />
              </Field>
            </div>
            <ImageUploadField
              label="Quote image"
              value={draft.about.quoteImage}
              folder="about"
              description="A wide kitchen or ingredient image works best behind the quote section."
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  about: { ...current.about, quoteImage: value },
                }))
              }
            />
            <Field label="What you'll find bullets">
              <Textarea
                rows={5}
                value={draft.about.whatsIncludedBody}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, whatsIncludedBody: event.target.value },
                  }))
                }
              />
            </Field>
            <ImageUploadField
              label="What you'll find image"
              value={draft.about.whatsIncludedImage}
              folder="about"
              description="Use a square supporting photo for the second About image slot."
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  about: { ...current.about, whatsIncludedImage: value },
                }))
              }
            />
            <Field label="Connect section body">
              <Textarea
                rows={4}
                value={draft.about.connectBody}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    about: { ...current.about, connectBody: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Newsletter title">
              <Input
                value={draft.newsletter.title}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    newsletter: { ...current.newsletter, title: event.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Newsletter body">
              <Textarea
                rows={3}
                value={draft.newsletter.body}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    newsletter: { ...current.newsletter, body: event.target.value },
                  }))
                }
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={saveDraft} disabled={isPending}>
          {isPending ? "Saving..." : "Save site draft"}
        </Button>
        <Button onClick={publishDraft} disabled={isPending} variant="secondary">
          Publish site changes
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setDraft(defaultSiteDraft)
            setMessage("Site draft reset to the current default mock content.")
          }}
        >
          Reset defaults
        </Button>
      </div>
    </div>
  )
}

function RecipeManager({
  items,
  onItemsChange,
}: {
  items: Recipe[]
  onItemsChange: (items: Recipe[]) => void
}): React.ReactElement {
  const [selectedId, setSelectedId] = useState<string>("new")
  const [form, setForm] = useState<RecipeForm>(createEmptyRecipe())
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedItem = items.find((item) => item.id === selectedId)

  const selectRecipe = (item?: Recipe) => {
    setSelectedId(item?.id ?? "new")
    setForm(item ? mapRecipeToForm(item) : createEmptyRecipe())
    setMessage(null)
  }

  const saveLabel = selectedItem ? "Save recipe" : "Create recipe"

  return (
    <EditorWorkspace
      title="Recipes"
      description="Structured recipe entries with steps, timings, hero images, and publish state."
      listHeader="Recipe library"
      listAction={
        <Button size="sm" onClick={() => selectRecipe()}>
          New recipe
        </Button>
      }
      list={
        <div className="space-y-2">
          {items.map((item) => (
            <RecordButton
              key={item.id}
              active={selectedId === item.id}
              title={item.title}
              subtitle={`${item.category} • ${item.published ? "Published" : "Draft"}`}
              meta={formatAdminDate(item.updatedAt)}
              imageValue={item.image}
              onClick={() => selectRecipe(item)}
            />
          ))}
        </div>
      }
      editor={
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault()
            setMessage(null)
            startTransition(async () => {
              try {
                const saved = (await saveRecipe({ data: form })) as Recipe
                onItemsChange(upsertByUpdatedAt<Recipe>(items, saved))
                selectRecipe(saved)
                setMessage("Recipe saved.")
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Could not save recipe.")
              }
            })
          }}
        >
          <StatusBar message={message} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
              />
            </Field>
            <Field label="Slug">
              <Input
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => ({ ...current, slug: event.target.value }))
                }
                placeholder="Auto-generated if left blank"
              />
            </Field>
          </div>
          <Field label="Description">
            <Textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Field label="Category">
              <Input
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value }))
                }
              />
            </Field>
            <Field label="Difficulty">
              <Select
                value={form.difficulty}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    difficulty: value as (typeof difficultyOptions)[number],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Prep minutes">
              <Input
                type="number"
                value={form.prepTime ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    prepTime: toNumberOrNull(event.target.value),
                  }))
                }
              />
            </Field>
            <Field label="Cook minutes">
              <Input
                type="number"
                value={form.cookTime ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    cookTime: toNumberOrNull(event.target.value),
                  }))
                }
              />
            </Field>
            <Field label="Servings">
              <Input
                type="number"
                value={form.servings ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    servings: toNumberOrNull(event.target.value),
                  }))
                }
              />
            </Field>
          </div>
          <ImageUploadField
            label="Hero image"
            value={form.image}
            folder="recipes"
            description="Use a finished-dish photo. Uploading here writes the image to RustFS and fills the URL."
            onChange={(value) => setForm((current) => ({ ...current, image: value }))}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <Field
              label="Ingredients"
              description="Put each ingredient on its own line. Group headings end with a colon, with a blank line between groups."
            >
              <Textarea
                rows={10}
                value={form.ingredientsText}
                onChange={(event) =>
                  setForm((current) => ({ ...current, ingredientsText: event.target.value }))
                }
                placeholder={"Main:\n2 eggs\n1 cup flour\n\nSauce:\n1 tbsp butter"}
              />
            </Field>
            <Field
              label="Instructions"
              description="Put one step on each line. Numbering is optional; the app will clean it up and renumber."
            >
              <Textarea
                rows={10}
                value={form.instructionsText}
                onChange={(event) =>
                  setForm((current) => ({ ...current, instructionsText: event.target.value }))
                }
                placeholder={"1. Prep the ingredients\n2. Cook\n3. Serve"}
              />
            </Field>
          </div>
          <Field
            label="Tips"
            description="One tip per line keeps the public recipe formatting clean."
          >
            <Textarea
              rows={4}
              value={form.tipsText}
              onChange={(event) =>
                setForm((current) => ({ ...current, tipsText: event.target.value }))
              }
              placeholder="One tip per line"
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <ToggleField
              label="Published"
              description="Published recipes can appear on the public site."
              checked={form.published}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, published: checked }))
              }
            />
            <ToggleField
              label="Featured"
              description="Featured recipes can feed the homepage hero and highlights."
              checked={form.featured}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, featured: checked }))
              }
            />
          </div>
          <EditorActions
            primaryLabel={isPending ? "Saving..." : saveLabel}
            primaryDisabled={isPending}
            onDelete={
              selectedItem
                ? () => {
                    startTransition(async () => {
                      try {
                        await deleteRecord({ data: { kind: "recipe", id: selectedItem.id } })
                        onItemsChange(items.filter((item) => item.id !== selectedItem.id))
                        selectRecipe()
                        setMessage("Recipe deleted.")
                      } catch (error) {
                        setMessage(
                          error instanceof Error ? error.message : "Could not delete recipe.",
                        )
                      }
                    })
                  }
                : undefined
            }
          />
        </form>
      }
      preview={<RecipePreview form={form} />}
    />
  )
}

function WineManager({
  items,
  onItemsChange,
}: {
  items: Wine[]
  onItemsChange: (items: Wine[]) => void
}): React.ReactElement {
  const [selectedId, setSelectedId] = useState<string>("new")
  const [form, setForm] = useState<WineForm>(createEmptyWine())
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedItem = items.find((item) => item.id === selectedId)

  const selectWine = (item?: Wine) => {
    setSelectedId(item?.id ?? "new")
    setForm(item ? mapWineToForm(item) : createEmptyWine())
    setMessage(null)
  }

  return (
    <EditorWorkspace
      title="Wines"
      description="Personal tasting entries with aromas, pairings, occasion notes, and feature state."
      listHeader="Wine cellar"
      listAction={
        <Button size="sm" onClick={() => selectWine()}>
          New wine
        </Button>
      }
      list={
        <div className="space-y-2">
          {items.map((item) => (
            <RecordButton
              key={item.id}
              active={selectedId === item.id}
              title={item.name}
              subtitle={`${item.winery} • ${item.published ? "Published" : "Draft"}`}
              meta={formatAdminDate(item.updatedAt)}
              imageValue={item.image}
              onClick={() => selectWine(item)}
            />
          ))}
        </div>
      }
      editor={
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault()
            setMessage(null)
            startTransition(async () => {
              try {
                const saved = (await saveWine({ data: form })) as Wine
                onItemsChange(upsertByUpdatedAt<Wine>(items, saved))
                selectWine(saved)
                setMessage("Wine saved.")
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Could not save wine.")
              }
            })
          }}
        >
          <StatusBar message={message} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </Field>
            <Field label="Slug">
              <Input
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => ({ ...current, slug: event.target.value }))
                }
                placeholder="Auto-generated if left blank"
              />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Field label="Winery">
              <Input
                value={form.winery}
                onChange={(event) =>
                  setForm((current) => ({ ...current, winery: event.target.value }))
                }
              />
            </Field>
            <Field label="Type">
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    type: value as (typeof wineTypeOptions)[number],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {wineTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Region">
              <Input
                value={form.region}
                onChange={(event) =>
                  setForm((current) => ({ ...current, region: event.target.value }))
                }
              />
            </Field>
            <Field label="Country">
              <Input
                value={form.country}
                onChange={(event) =>
                  setForm((current) => ({ ...current, country: event.target.value }))
                }
              />
            </Field>
            <Field label="Vintage">
              <Input
                type="number"
                value={form.vintage ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    vintage: toNumberOrNull(event.target.value),
                  }))
                }
              />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Grapes">
              <Input
                value={form.grapes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, grapes: event.target.value }))
                }
              />
            </Field>
            <Field label="Rating">
              <Input
                type="number"
                min={1}
                max={5}
                value={form.rating ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, rating: toNumberOrNull(event.target.value) }))
                }
              />
            </Field>
            <Field label="Price range">
              <Select
                value={form.priceRange ?? "none"}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    priceRange:
                      value === "none" ? null : (value as (typeof priceRangeOptions)[number]),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not set</SelectItem>
                  {priceRangeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Occasion">
              <Input
                value={form.occasion}
                onChange={(event) =>
                  setForm((current) => ({ ...current, occasion: event.target.value }))
                }
              />
            </Field>
          </div>
          <ImageUploadField
            label="Hero image"
            value={form.image}
            folder="wines"
            description="Bottle, glass, or vineyard photos work best. Uploading here stores it in RustFS."
            onChange={(value) => setForm((current) => ({ ...current, image: value }))}
          />
          <Field label="Notes">
            <Textarea
              rows={5}
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </Field>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field
              label="Aromas"
              description="One aroma per line. Keep them short for the public card layout."
            >
              <Textarea
                rows={6}
                value={form.aromasText}
                onChange={(event) =>
                  setForm((current) => ({ ...current, aromasText: event.target.value }))
                }
                placeholder="One aroma per line"
              />
            </Field>
            <Field
              label="Pairings"
              description="One pairing per line. Use plain food names rather than long sentences."
            >
              <Textarea
                rows={6}
                value={form.pairingsText}
                onChange={(event) =>
                  setForm((current) => ({ ...current, pairingsText: event.target.value }))
                }
                placeholder="One pairing per line"
              />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ToggleField
              label="Published"
              description="Published wines appear in the public wine cellar."
              checked={form.published}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, published: checked }))
              }
            />
            <ToggleField
              label="Featured"
              description="Featured wines can be highlighted in the admin overview."
              checked={form.featured}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, featured: checked }))
              }
            />
          </div>
          <EditorActions
            primaryLabel={isPending ? "Saving..." : selectedItem ? "Save wine" : "Create wine"}
            primaryDisabled={isPending}
            onDelete={
              selectedItem
                ? () => {
                    startTransition(async () => {
                      try {
                        await deleteRecord({ data: { kind: "wine", id: selectedItem.id } })
                        onItemsChange(items.filter((item) => item.id !== selectedItem.id))
                        selectWine()
                        setMessage("Wine deleted.")
                      } catch (error) {
                        setMessage(
                          error instanceof Error ? error.message : "Could not delete wine.",
                        )
                      }
                    })
                  }
                : undefined
            }
          />
        </form>
      }
      preview={<WinePreview form={form} />}
    />
  )
}

function ExperimentManager({
  items,
  recipes,
  onItemsChange,
}: {
  items: ExperimentWithEntries[]
  recipes: Recipe[]
  onItemsChange: (items: ExperimentWithEntries[]) => void
}): React.ReactElement {
  const [selectedId, setSelectedId] = useState<string>("new")
  const [form, setForm] = useState<ExperimentForm>(createEmptyExperiment())
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedItem = items.find((item) => item.id === selectedId)

  const selectExperiment = (item?: ExperimentWithEntries) => {
    setSelectedId(item?.id ?? "new")
    setForm(item ? mapExperimentToForm(item) : createEmptyExperiment())
    setMessage(null)
  }

  return (
    <EditorWorkspace
      title="Test Kitchen"
      description="Experiments have a parent entry plus a timeline of updates, notes, photos, and results."
      listHeader="Experiment log"
      listAction={
        <Button size="sm" onClick={() => selectExperiment()}>
          New experiment
        </Button>
      }
      list={
        <div className="space-y-2">
          {items.map((item) => (
            <RecordButton
              key={item.id}
              active={selectedId === item.id}
              title={item.title}
              subtitle={`${humanizeExperimentStatus(item.status)} • ${item.published ? "Published" : "Draft"}`}
              meta={formatAdminDate(item.updatedAt)}
              imageValue={item.image}
              onClick={() => selectExperiment(item)}
            />
          ))}
        </div>
      }
      editor={
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault()
            setMessage(null)
            startTransition(async () => {
              try {
                const saved = (await saveExperiment({ data: form })) as ExperimentWithEntries
                onItemsChange(upsertByUpdatedAt<ExperimentWithEntries>(items, saved))
                selectExperiment(saved)
                setMessage("Experiment saved.")
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Could not save experiment.")
              }
            })
          }}
        >
          <StatusBar message={message} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
              />
            </Field>
            <Field label="Slug">
              <Input
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => ({ ...current, slug: event.target.value }))
                }
                placeholder="Auto-generated if left blank"
              />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Status">
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    status: value as (typeof experimentStatusOptions)[number],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {experimentStatusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {humanizeExperimentStatus(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Graduated recipe">
              <Select
                value={form.recipeId ?? "none"}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    recipeId: value === "none" ? null : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not linked</SelectItem>
                  {recipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {recipe.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <ImageUploadField
            label="Hero image"
            value={form.image}
            folder="experiments"
            description="Use the best photo for the experiment overview. Timeline photos can go in entry image URLs."
            onChange={(value) => setForm((current) => ({ ...current, image: value }))}
          />
          <Field label="Description">
            <Textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </Field>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Hypothesis">
              <Textarea
                rows={5}
                value={form.hypothesis}
                onChange={(event) =>
                  setForm((current) => ({ ...current, hypothesis: event.target.value }))
                }
              />
            </Field>
            <Field label="Result">
              <Textarea
                rows={5}
                value={form.result}
                onChange={(event) =>
                  setForm((current) => ({ ...current, result: event.target.value }))
                }
              />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ToggleField
              label="Published"
              description="Published experiments appear on the public test-kitchen page."
              checked={form.published}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, published: checked }))
              }
            />
            <ToggleField
              label="Featured"
              description="Featured experiments can be highlighted in the admin overview."
              checked={form.featured}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, featured: checked }))
              }
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Experiment timeline</h3>
                <p className="text-sm text-muted-foreground">
                  Add the updates, notes, photo drops, and results that tell the story.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    entries: [
                      ...current.entries,
                      { ...createEmptyExperimentEntry(), sortOrder: current.entries.length },
                    ],
                  }))
                }
              >
                Add entry
              </Button>
            </div>
            <div className="space-y-4">
              {form.entries.map((entry, index) => (
                <div key={entry.id ?? `entry-${index}`} className="rounded-md border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-medium">Entry {index + 1}</div>
                    {form.entries.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            entries: current.entries.filter(
                              (_, currentIndex) => currentIndex !== index,
                            ),
                          }))
                        }
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Entry type">
                      <Select
                        value={entry.entryType}
                        onValueChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            entries: current.entries.map((currentEntry, currentIndex) =>
                              currentIndex === index
                                ? {
                                    ...currentEntry,
                                    entryType: value as (typeof experimentEntryTypeOptions)[number],
                                  }
                                : currentEntry,
                            ),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {experimentEntryTypeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {humanizeExperimentStatus(option)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Sort order">
                      <Input
                        type="number"
                        value={entry.sortOrder}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            entries: current.entries.map((currentEntry, currentIndex) =>
                              currentIndex === index
                                ? {
                                    ...currentEntry,
                                    sortOrder: Number(event.target.value || 0),
                                  }
                                : currentEntry,
                            ),
                          }))
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Content">
                    <Textarea
                      rows={5}
                      value={entry.content}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          entries: current.entries.map((currentEntry, currentIndex) =>
                            currentIndex === index
                              ? { ...currentEntry, content: event.target.value }
                              : currentEntry,
                          ),
                        }))
                      }
                    />
                  </Field>
                  <Field
                    label="Image URLs"
                    description="One image URL per line. Use the Images tab to upload several photos, then paste URLs here."
                  >
                    <Textarea
                      rows={3}
                      value={entry.imagesText}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          entries: current.entries.map((currentEntry, currentIndex) =>
                            currentIndex === index
                              ? { ...currentEntry, imagesText: event.target.value }
                              : currentEntry,
                          ),
                        }))
                      }
                      placeholder="One image URL per line"
                    />
                  </Field>
                </div>
              ))}
            </div>
          </div>
          <EditorActions
            primaryLabel={
              isPending ? "Saving..." : selectedItem ? "Save experiment" : "Create experiment"
            }
            primaryDisabled={isPending}
            onDelete={
              selectedItem
                ? () => {
                    startTransition(async () => {
                      try {
                        await deleteRecord({ data: { kind: "experiment", id: selectedItem.id } })
                        onItemsChange(items.filter((item) => item.id !== selectedItem.id))
                        selectExperiment()
                        setMessage("Experiment deleted.")
                      } catch (error) {
                        setMessage(
                          error instanceof Error ? error.message : "Could not delete experiment.",
                        )
                      }
                    })
                  }
                : undefined
            }
          />
        </form>
      }
      preview={<ExperimentPreview form={form} />}
    />
  )
}

function GalleryManager({
  items,
  onItemsChange,
}: {
  items: GalleryImage[]
  onItemsChange: (items: GalleryImage[]) => void
}): React.ReactElement {
  const [selectedId, setSelectedId] = useState<string>("new")
  const [form, setForm] = useState<GalleryForm>(createEmptyGalleryImage())
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedItem = items.find((item) => item.id === selectedId)

  const selectGalleryImage = (item?: GalleryImage) => {
    setSelectedId(item?.id ?? "new")
    setForm(item ? mapGalleryToForm(item) : createEmptyGalleryImage())
    setMessage(null)
  }

  return (
    <EditorWorkspace
      title="Garden & Flock"
      description="Gallery entries for the homestead page, including captions, categories, and sort order."
      listHeader="Image library"
      listAction={
        <Button size="sm" onClick={() => selectGalleryImage()}>
          New image
        </Button>
      }
      list={
        <div className="space-y-2">
          {items.map((item) => (
            <RecordButton
              key={item.id}
              active={selectedId === item.id}
              title={item.title || "Untitled image"}
              subtitle={`${capitalize(item.category)} • ${item.published ? "Published" : "Draft"}`}
              meta={formatAdminDate(item.updatedAt)}
              imageValue={item.image}
              onClick={() => selectGalleryImage(item)}
            />
          ))}
        </div>
      }
      editor={
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault()
            setMessage(null)
            startTransition(async () => {
              try {
                const saved = (await saveGalleryImage({ data: form })) as GalleryImage
                onItemsChange(upsertByUpdatedAt<GalleryImage>(items, saved))
                selectGalleryImage(saved)
                setMessage("Gallery image saved.")
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Could not save image.")
              }
            })
          }}
        >
          <StatusBar message={message} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
              />
            </Field>
            <Field label="Category">
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    category: value as (typeof galleryCategoryOptions)[number],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {galleryCategoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {capitalize(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Caption">
            <Textarea
              rows={4}
              value={form.caption}
              onChange={(event) =>
                setForm((current) => ({ ...current, caption: event.target.value }))
              }
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <ImageUploadField
              label="Image"
              value={form.image}
              folder="gallery"
              description="Upload garden or flock images here, then publish when the caption is ready."
              onChange={(value) => setForm((current) => ({ ...current, image: value }))}
            />
            <Field label="Taken at">
              <Input
                type="date"
                value={form.takenAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, takenAt: event.target.value }))
                }
              />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Sort order">
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sortOrder: Number(event.target.value || 0),
                  }))
                }
              />
            </Field>
            <ToggleField
              label="Published"
              description="Published images appear on the public gallery."
              checked={form.published}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, published: checked }))
              }
            />
            <ToggleField
              label="Featured"
              description="Reserve for special highlights."
              checked={form.featured}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, featured: checked }))
              }
            />
          </div>
          <EditorActions
            primaryLabel={isPending ? "Saving..." : selectedItem ? "Save image" : "Create image"}
            primaryDisabled={isPending}
            onDelete={
              selectedItem
                ? () => {
                    startTransition(async () => {
                      try {
                        await deleteRecord({ data: { kind: "gallery", id: selectedItem.id } })
                        onItemsChange(items.filter((item) => item.id !== selectedItem.id))
                        selectGalleryImage()
                        setMessage("Gallery image deleted.")
                      } catch (error) {
                        setMessage(
                          error instanceof Error ? error.message : "Could not delete image.",
                        )
                      }
                    })
                  }
                : undefined
            }
          />
        </form>
      }
      preview={<GalleryPreview form={form} />}
    />
  )
}

function ImageManager(): React.ReactElement {
  const [folder, setFolder] = useState<"all" | ManagedAssetFolder>("all")
  const [uploadFolder, setUploadFolder] = useState<ManagedAssetFolder>("about")
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const queryClient = useQueryClient()
  const assetsQuery = useQuery({
    queryKey: ["managed-assets", folder],
    queryFn: () => listManagedAssets({ data: { folder, limit: 150 } }),
    staleTime: 30_000,
  })
  const assets = assetsQuery.data ?? []

  const refreshAssets = () => {
    setMessage(null)
    startTransition(async () => {
      try {
        const result = await assetsQuery.refetch()
        if (result.error) throw result.error
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load images.")
      }
    })
  }

  const uploadFile = (file: File) => {
    setMessage(null)
    startTransition(async () => {
      try {
        const uploaded = await uploadImageFile(file, uploadFolder)
        setFolder(uploadFolder)
        queryClient.setQueryData<ManagedImageAsset[]>(
          ["managed-assets", uploadFolder],
          (current = []) => [uploaded, ...current.filter((asset) => asset.key !== uploaded.key)],
        )
        setMessage(`Uploaded ${uploaded.key}.`)
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not upload image.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image manager</CardTitle>
          <CardDescription>
            Upload and manage the main site photos stored in the tastingswithtay RustFS bucket.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-md border border-dashed p-4">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Upload a photo</div>
                <p className="text-sm text-muted-foreground">
                  Choose where the photo belongs first so the bucket stays easy to browse.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)]">
                <Select
                  value={uploadFolder}
                  onValueChange={(value) => setUploadFolder(value as ManagedAssetFolder)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {managedAssetFolderOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {capitalize(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="file"
                  accept="image/avif,image/jpeg,image/png,image/webp"
                  disabled={isPending}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0]
                    event.currentTarget.value = ""
                    if (file) uploadFile(file)
                  }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="text-sm font-medium">Browse folder</div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Select
                value={folder}
                onValueChange={(value) => setFolder(value as "all" | ManagedAssetFolder)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All images</SelectItem>
                  {managedAssetFolderOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {capitalize(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                className="sm:w-auto"
                disabled={isPending || assetsQuery.isFetching}
                onClick={refreshAssets}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <StatusBar
        message={message ?? (assetsQuery.error instanceof Error ? assetsQuery.error.message : null)}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <Card key={asset.key} className="overflow-hidden">
            <div className="aspect-[4/3] bg-muted">
              <img
                src={imagePreviewSrcFor(asset.url) ?? asset.url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <CardContent className="space-y-3 p-4">
              <div>
                <div className="break-all text-sm font-medium">{asset.key}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatBytes(asset.size)} • {formatAdminDate(asset.lastModified)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard?.writeText(asset.url)
                    setMessage("Image path copied.")
                  }}
                >
                  Copy URL
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => {
                    setMessage(null)
                    startTransition(async () => {
                      try {
                        await deleteManagedAsset({ data: { key: asset.key } })
                        queryClient.setQueryData<ManagedImageAsset[]>(
                          ["managed-assets", folder],
                          (current = []) => current.filter((item) => item.key !== asset.key),
                        )
                        setMessage("Image deleted from RustFS.")
                      } catch (error) {
                        setMessage(
                          error instanceof Error ? error.message : "Could not delete image.",
                        )
                      }
                    })
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assets.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {isPending ? "Loading images..." : "No images found in this folder yet."}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function TaxonomyManager({
  draft,
  setDraft,
  hydrated,
  recipes,
  wines,
}: {
  draft: TaxonomyDraft
  setDraft: React.Dispatch<React.SetStateAction<TaxonomyDraft>>
  hydrated: boolean
  recipes: Recipe[]
  wines: Wine[]
}): React.ReactElement {
  const [message, setMessage] = useState<string | null>(null)

  if (!hydrated) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-10 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          Loading taxonomy draft...
        </CardContent>
      </Card>
    )
  }

  const saveDraft = () => {
    console.log("Taxonomy draft saved", draft)
    setMessage("Taxonomy draft saved locally in this browser and logged to the console.")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tags, collections, and pairings</CardTitle>
          <CardDescription>
            This is the planning space for all the content relationships that deserve a thoughtful
            model before we wire them into the live site.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <InfoRow
            title="Tags"
            body="Use tags to shape future filtering and discovery. Keep names simple and editor-friendly."
          />
          <InfoRow
            title="Collections"
            body="Collections are curated groupings like Sunday Suppers, Holiday Menus, or Patio Wines."
          />
          <InfoRow
            title="Pairings"
            body="Recipe-to-wine pairings can become the connective layer between the food and wine experiences."
          />
        </CardContent>
      </Card>

      {message ? (
        <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">{message}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Draft the vocab Tay will actually use.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {draft.tags.map((tag) => (
              <div key={tag.id} className="rounded-md border p-3">
                <div className="grid gap-3">
                  <Input
                    value={tag.name}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        tags: current.tags.map((item) =>
                          item.id === tag.id ? { ...item, name: event.target.value } : item,
                        ),
                      }))
                    }
                    placeholder="Tag name"
                  />
                  <Select
                    value={tag.type}
                    onValueChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        tags: current.tags.map((item) =>
                          item.id === tag.id
                            ? { ...item, type: value as (typeof tagTypeOptions)[number] }
                            : item,
                        ),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tagTypeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        tags: current.tags.filter((item) => item.id !== tag.id),
                      }))
                    }
                  >
                    Remove tag
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  tags: [...current.tags, { id: createDraftId(), name: "", type: "both" }],
                }))
              }
            >
              Add tag
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collections</CardTitle>
            <CardDescription>
              Curated sets of recipes or wines for future landing surfaces.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {draft.collections.map((collection) => (
              <div key={collection.id} className="rounded-md border p-3">
                <div className="space-y-3">
                  <Input
                    value={collection.name}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        collections: current.collections.map((item) =>
                          item.id === collection.id ? { ...item, name: event.target.value } : item,
                        ),
                      }))
                    }
                    placeholder="Collection name"
                  />
                  <Textarea
                    rows={4}
                    value={collection.description}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        collections: current.collections.map((item) =>
                          item.id === collection.id
                            ? { ...item, description: event.target.value }
                            : item,
                        ),
                      }))
                    }
                    placeholder="Description"
                  />
                  <ToggleField
                    label="Featured"
                    description="Reserve for high-priority curated sets."
                    checked={collection.featured}
                    onCheckedChange={(checked) =>
                      setDraft((current) => ({
                        ...current,
                        collections: current.collections.map((item) =>
                          item.id === collection.id ? { ...item, featured: checked } : item,
                        ),
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        collections: current.collections.filter(
                          (item) => item.id !== collection.id,
                        ),
                      }))
                    }
                  >
                    Remove collection
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  collections: [
                    ...current.collections,
                    { id: createDraftId(), name: "", description: "", featured: false },
                  ],
                }))
              }
            >
              Add collection
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recipe + wine pairings</CardTitle>
            <CardDescription>
              Mock the future pairing editor before we wire the junction table.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {draft.pairings.map((pairing) => (
              <div key={pairing.id} className="rounded-md border p-3">
                <div className="space-y-3">
                  <Select
                    value={pairing.recipeId || "none"}
                    onValueChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        pairings: current.pairings.map((item) =>
                          item.id === pairing.id
                            ? { ...item, recipeId: value === "none" ? "" : value }
                            : item,
                        ),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Recipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Choose recipe</SelectItem>
                      {recipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={pairing.wineId || "none"}
                    onValueChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        pairings: current.pairings.map((item) =>
                          item.id === pairing.id
                            ? { ...item, wineId: value === "none" ? "" : value }
                            : item,
                        ),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Choose wine</SelectItem>
                      {wines.map((wine) => (
                        <SelectItem key={wine.id} value={wine.id}>
                          {wine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    rows={3}
                    value={pairing.note}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        pairings: current.pairings.map((item) =>
                          item.id === pairing.id ? { ...item, note: event.target.value } : item,
                        ),
                      }))
                    }
                    placeholder="Why this pairing works"
                  />
                  <ToggleField
                    label="Primary pairing"
                    description="Use this for the featured recommendation."
                    checked={pairing.isPrimary}
                    onCheckedChange={(checked) =>
                      setDraft((current) => ({
                        ...current,
                        pairings: current.pairings.map((item) =>
                          item.id === pairing.id ? { ...item, isPrimary: checked } : item,
                        ),
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        pairings: current.pairings.filter((item) => item.id !== pairing.id),
                      }))
                    }
                  >
                    Remove pairing
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  pairings: [
                    ...current.pairings,
                    {
                      id: createDraftId(),
                      recipeId: "",
                      wineId: "",
                      note: "",
                      isPrimary: false,
                    },
                  ],
                }))
              }
            >
              Add pairing
            </Button>
            <Field label="Planning notes">
              <Textarea
                rows={4}
                value={draft.notes}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={saveDraft}>Save taxonomy draft</Button>
        <Button
          variant="outline"
          onClick={() => {
            setDraft(defaultTaxonomyDraft)
            setMessage("Taxonomy draft reset to the current default mock content.")
          }}
        >
          Reset defaults
        </Button>
      </div>
    </div>
  )
}

function UsersPanel({
  users,
  currentUserId,
  onUsersChange,
}: {
  users: AdminUserRecord[]
  currentUserId: string
  onUsersChange: (users: AdminUserRecord[]) => void
}): React.ReactElement {
  const [searchValue, setSearchValue] = useState("")
  const [draftRoles, setDraftRoles] = useState<Record<string, ManagedRole>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const deferredSearch = useDeferredValue(searchValue)

  const filteredUsers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()
    const sorted = [...users].sort((left, right) => {
      const leftAdmin = toManagedRole(left.role) === "admin" ? 1 : 0
      const rightAdmin = toManagedRole(right.role) === "admin" ? 1 : 0

      if (leftAdmin !== rightAdmin) {
        return rightAdmin - leftAdmin
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    })

    if (!query) {
      return sorted
    }

    return sorted.filter((user) =>
      [user.name, user.email, toManagedRole(user.role)].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [deferredSearch, users])

  const saveRole = (user: AdminUserRecord) => {
    const nextRole = draftRoles[user.id] ?? toManagedRole(user.role)
    if (nextRole === toManagedRole(user.role)) {
      return
    }

    setMessage(null)
    setError(null)
    setPendingUserId(user.id)

    startTransition(async () => {
      try {
        const updatedUser = await updateAdminUserRole({
          data: {
            userId: user.id,
            role: nextRole,
          },
        })

        onUsersChange(users.map((entry) => (entry.id === updatedUser.id ? updatedUser : entry)))
        setDraftRoles((current) => {
          const next = { ...current }
          delete next[user.id]
          return next
        })
        setMessage(`${updatedUser.email} is now ${toManagedRole(updatedUser.role)}.`)
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Could not update that role right now.",
        )
      } finally {
        setPendingUserId(null)
      }
    })
  }

  return (
    <Card>
      <CardHeader className="gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <CardTitle>User directory</CardTitle>
          <CardDescription>Every account, with simple admin-role management.</CardDescription>
        </div>
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search users"
          className="w-full md:max-w-xs"
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {message ? <div className="rounded-md border px-3 py-2 text-sm">{message}</div> : null}
        {error ? (
          <div className="rounded-md border border-destructive/20 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="space-y-3 md:hidden">
          {filteredUsers.map((user) => {
            const currentRole = toManagedRole(user.role)
            const selectedRole = draftRoles[user.id] ?? currentRole
            const isCurrentUser = user.id === currentUserId
            const isSaving = pendingUserId === user.id && isPending

            return (
              <UserMobileCard
                key={user.id}
                user={user}
                currentRole={currentRole}
                selectedRole={selectedRole}
                isCurrentUser={isCurrentUser}
                isSaving={isSaving}
                onRoleChange={(value) =>
                  setDraftRoles((current) => ({
                    ...current,
                    [user.id]: value,
                  }))
                }
                onSave={() => saveRole(user)}
              />
            )
          })}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const currentRole = toManagedRole(user.role)
                const selectedRole = draftRoles[user.id] ?? currentRole
                const isCurrentUser = user.id === currentUserId
                const isSaving = pendingUserId === user.id && isPending

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{initialsFor(user.name || user.email)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{user.name || "Unnamed user"}</div>
                          {isCurrentUser ? (
                            <div className="text-xs text-muted-foreground">Current session</div>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate">{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={selectedRole}
                        onValueChange={(value) =>
                          setDraftRoles((current) => ({
                            ...current,
                            [user.id]: value as ManagedRole,
                          }))
                        }
                        disabled={isCurrentUser}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">admin</SelectItem>
                          <SelectItem value="user">user</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={currentRole === "admin" ? "default" : "secondary"}>
                          {currentRole}
                        </Badge>
                        <Badge variant="outline">
                          {user.emailVerified ? "verified" : "unverified"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{formatAdminDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {isCurrentUser ? (
                        <span className="text-xs text-muted-foreground">You</span>
                      ) : (
                        <Button
                          size="sm"
                          variant={selectedRole === currentRole ? "outline" : "default"}
                          disabled={isSaving || selectedRole === currentRole}
                          onClick={() => saveRole(user)}
                        >
                          {isSaving ? (
                            <span className="inline-flex items-center gap-2">
                              <Spinner className="size-4" />
                              Saving
                            </span>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function UserMobileCard({
  user,
  currentRole,
  selectedRole,
  isCurrentUser,
  isSaving,
  onRoleChange,
  onSave,
}: {
  user: AdminUserRecord
  currentRole: ManagedRole
  selectedRole: ManagedRole
  isCurrentUser: boolean
  isSaving: boolean
  onRoleChange: (value: ManagedRole) => void
  onSave: () => void
}): React.ReactElement {
  return (
    <div className="rounded-md border p-4">
      <div className="flex min-w-0 items-start gap-3">
        <Avatar>
          <AvatarFallback>{initialsFor(user.name || user.email)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{user.name || "Unnamed user"}</div>
          <div className="break-all text-sm text-muted-foreground">{user.email}</div>
          {isCurrentUser ? (
            <div className="mt-1 text-xs text-muted-foreground">Current session</div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant={currentRole === "admin" ? "default" : "secondary"}>{currentRole}</Badge>
        <Badge variant="outline">{user.emailVerified ? "verified" : "unverified"}</Badge>
        <Badge variant="outline">Joined {formatAdminDate(user.createdAt)}</Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Select
          value={selectedRole}
          onValueChange={(value) => onRoleChange(value as ManagedRole)}
          disabled={isCurrentUser}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">admin</SelectItem>
            <SelectItem value="user">user</SelectItem>
          </SelectContent>
        </Select>
        {isCurrentUser ? (
          <Button type="button" variant="outline" disabled>
            You
          </Button>
        ) : (
          <Button
            type="button"
            disabled={isSaving || selectedRole === currentRole}
            onClick={onSave}
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="size-4" />
                Saving
              </span>
            ) : (
              "Save role"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

function ContentTab({
  value,
  label,
  draft = false,
}: {
  value: ContentSectionId
  label: string
  draft?: boolean
}): React.ReactElement {
  return (
    <TabsTrigger
      value={value}
      className="min-h-10 w-full justify-center gap-1.5 px-2 text-xs sm:text-sm"
    >
      <span className="truncate">{label}</span>
      {draft ? (
        <Badge variant="outline" className="hidden sm:inline-flex">
          Draft
        </Badge>
      ) : null}
    </TabsTrigger>
  )
}

function EditorWorkspace({
  title,
  description,
  listHeader,
  listAction,
  list,
  editor,
  preview,
}: {
  title: string
  description: string
  listHeader: string
  listAction: React.ReactNode
  list: React.ReactNode
  editor: React.ReactNode
  preview?: React.ReactNode
}): React.ReactElement {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader className="gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">{listHeader}</CardTitle>
              </div>
              {listAction}
            </div>
          </CardHeader>
          <CardContent>{list}</CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {preview ? (
              <Tabs defaultValue="edit" className="gap-6">
                <TabsList className="grid w-full grid-cols-2 sm:inline-grid sm:w-auto">
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">{editor}</TabsContent>
                <TabsContent value="preview">{preview}</TabsContent>
              </Tabs>
            ) : (
              editor
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Field({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}): React.ReactElement {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>{label}</Label>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  )
}

function ImageUploadField({
  label,
  value,
  folder,
  description,
  onChange,
}: {
  label: string
  value: string
  folder: ManagedAssetFolder
  description?: string
  onChange: (value: string) => void
}): React.ReactElement {
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const imageHealth = imageHealthFor(value)
  const previewSrc = imageHealth.status === "ready" ? imagePreviewSrcFor(value) : ""

  return (
    <Field label={label} description={description}>
      <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
        <div
          className={`aspect-[4/3] overflow-hidden rounded-md border ${imageHealthClassName(imageHealth.status)}`}
        >
          {previewSrc ? (
            <img src={previewSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-xs">
              <span className="font-semibold">{imageHealth.label}</span>
              <span>{imageHealth.description}</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={imageHealth.status === "ready" ? "secondary" : "destructive"}>
              {imageHealth.label}
            </Badge>
            <span className="text-xs text-muted-foreground">{imageHealth.description}</span>
          </div>
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Upload to fill this with a RustFS image path"
            aria-invalid={imageHealth.status !== "ready"}
          />
          <Input
            type="file"
            accept="image/avif,image/jpeg,image/png,image/webp"
            disabled={isPending}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0]
              event.currentTarget.value = ""
              if (!file) return

              setMessage(null)
              startTransition(async () => {
                try {
                  const uploaded = await uploadImageFile(file, folder)
                  onChange(uploaded.url)
                  setMessage(`Uploaded ${uploaded.key}.`)
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Could not upload image.")
                }
              })
            }}
          />
          {value ? (
            <Button type="button" variant="outline" size="sm" onClick={() => onChange("")}>
              Clear image
            </Button>
          ) : null}
          {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
        </div>
      </div>
    </Field>
  )
}

function ToggleField({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}): React.ReactElement {
  return (
    <div className="rounded-md border p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label>{label}</Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  )
}

function RecordButton({
  active,
  title,
  subtitle,
  meta,
  imageValue,
  onClick,
}: {
  active: boolean
  title: string
  subtitle: string
  meta: string
  imageValue?: string | null
  onClick: () => void
}): React.ReactElement {
  const imageHealth = imageValue === undefined ? null : imageHealthFor(imageValue)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-md border p-3 text-left transition-colors ${
        active ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">{title}</div>
        {imageHealth ? (
          <Badge
            variant={imageHealth.status === "ready" ? "secondary" : "destructive"}
            className="shrink-0"
          >
            {imageHealth.status === "ready" ? "Image ok" : "Needs image"}
          </Badge>
        ) : null}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
      <div className="mt-2 text-xs text-muted-foreground">{meta}</div>
    </button>
  )
}

function EditorActions({
  primaryLabel,
  primaryDisabled,
  onDelete,
}: {
  primaryLabel: string
  primaryDisabled: boolean
  onDelete?: () => void
}): React.ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" disabled={primaryDisabled}>
        {primaryLabel}
      </Button>
      {onDelete ? (
        <Button type="button" variant="outline" onClick={onDelete}>
          Delete
        </Button>
      ) : null}
    </div>
  )
}

function RecipePreview({ form }: { form: RecipeForm }): React.ReactElement {
  const ingredients = splitPreviewLines(form.ingredientsText)
  const instructions = splitPreviewLines(form.instructionsText).map((line) =>
    line.replace(/^\d+[.)]\s*/, ""),
  )
  const tips = splitPreviewLines(form.tipsText)

  return (
    <PreviewSurface image={form.image} title={form.title || "Untitled recipe"}>
      <p className="text-sm text-muted-foreground">{form.description || "No description yet."}</p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{form.category || "No category"}</Badge>
        <Badge variant="outline">{form.difficulty}</Badge>
        {form.prepTime ? <Badge variant="outline">{form.prepTime} min prep</Badge> : null}
        {form.cookTime ? <Badge variant="outline">{form.cookTime} min cook</Badge> : null}
      </div>
      <PreviewList
        title="Ingredients"
        items={ingredients}
        empty="Add ingredients to preview them."
      />
      <PreviewList
        title="Instructions"
        items={instructions}
        ordered
        empty="Add steps to preview them."
      />
      <PreviewList title="Tips" items={tips} empty="Tips are optional." />
    </PreviewSurface>
  )
}

function WinePreview({ form }: { form: WineForm }): React.ReactElement {
  return (
    <PreviewSurface image={form.image} title={form.name || "Untitled wine"}>
      <p className="text-sm text-muted-foreground">
        {[form.winery, form.region, form.country].filter(Boolean).join(" • ") ||
          "Add winery and region details."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{form.type}</Badge>
        {form.vintage ? <Badge variant="outline">{form.vintage}</Badge> : null}
        {form.rating ? <Badge variant="outline">{form.rating}/5</Badge> : null}
        {form.priceRange ? <Badge variant="outline">{form.priceRange}</Badge> : null}
      </div>
      {form.notes ? <p className="text-sm leading-relaxed">{form.notes}</p> : null}
      <PreviewList
        title="Aromas"
        items={splitPreviewLines(form.aromasText)}
        empty="Aromas are optional."
      />
      <PreviewList
        title="Pairings"
        items={splitPreviewLines(form.pairingsText)}
        empty="Pairings are optional."
      />
    </PreviewSurface>
  )
}

function ExperimentPreview({ form }: { form: ExperimentForm }): React.ReactElement {
  return (
    <PreviewSurface image={form.image} title={form.title || "Untitled experiment"}>
      <p className="text-sm text-muted-foreground">{form.description || "No description yet."}</p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{humanizeExperimentStatus(form.status)}</Badge>
        {form.published ? <Badge>Published</Badge> : <Badge variant="outline">Draft</Badge>}
      </div>
      {form.hypothesis ? <PreviewText title="Hypothesis" body={form.hypothesis} /> : null}
      {form.result ? <PreviewText title="Result" body={form.result} /> : null}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Timeline</h3>
        {form.entries.map((entry, index) => (
          <div key={entry.id ?? index} className="rounded-md border p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {humanizeExperimentStatus(entry.entryType)}
            </div>
            <p className="mt-2 text-sm leading-relaxed">{entry.content || "No entry text yet."}</p>
            <PreviewList
              title="Images"
              items={splitPreviewLines(entry.imagesText)}
              empty="No entry images."
            />
          </div>
        ))}
      </div>
    </PreviewSurface>
  )
}

function GalleryPreview({ form }: { form: GalleryForm }): React.ReactElement {
  return (
    <PreviewSurface image={form.image} title={form.title || "Untitled image"}>
      <p className="text-sm text-muted-foreground">{form.caption || "No caption yet."}</p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{capitalize(form.category)}</Badge>
        {form.takenAt ? <Badge variant="outline">{form.takenAt}</Badge> : null}
        {form.published ? <Badge>Published</Badge> : <Badge variant="outline">Draft</Badge>}
      </div>
    </PreviewSurface>
  )
}

function PreviewSurface({
  image,
  title,
  children,
}: {
  image: string
  title: string
  children: React.ReactNode
}): React.ReactElement {
  const imageHealth = imageHealthFor(image)
  const previewSrc = imageHealth.status === "ready" ? imagePreviewSrcFor(image) : ""

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-md border bg-background">
        <div className={`aspect-[16/9] ${imageHealthClassName(imageHealth.status)}`}>
          {previewSrc ? (
            <img src={previewSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm">
              <span className="font-semibold">{imageHealth.label}</span>
              <span>{imageHealth.description}</span>
            </div>
          )}
        </div>
        <div className="space-y-4 p-5">
          <h2 className="font-serif text-2xl font-semibold">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  )
}

function PreviewText({ title, body }: { title: string; body: string }): React.ReactElement {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}

function PreviewList({
  title,
  items,
  empty,
  ordered = false,
}: {
  title: string
  items: string[]
  empty: string
  ordered?: boolean
}): React.ReactElement {
  const ListElement = ordered ? "ol" : "ul"

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {items.length > 0 ? (
        <ListElement
          className={ordered ? "list-decimal space-y-1 pl-5" : "list-disc space-y-1 pl-5"}
        >
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="text-sm text-muted-foreground">
              {item}
            </li>
          ))}
        </ListElement>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  )
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}): React.ReactElement {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
    </Card>
  )
}

function KeyValueRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function InfoRow({ title, body }: { title: string; body: string }): React.ReactElement {
  return (
    <div className="rounded-md border p-4">
      <div className="mb-2 text-sm font-medium">{title}</div>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  )
}

function StatusBar({ message }: { message: string | null }): React.ReactElement | null {
  if (!message) return null

  return <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">{message}</div>
}

function useLocalStorageDraft<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initialValue)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const raw = window.localStorage.getItem(key)
      if (raw) {
        setValue(JSON.parse(raw) as T)
      }
    } catch (error) {
      console.warn(`Could not load local draft for ${key}`, error)
    } finally {
      setHydrated(true)
    }
  }, [key])

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Could not persist local draft for ${key}`, error)
    }
  }, [hydrated, key, value])

  return [value, setValue, hydrated]
}

function toManagedRole(role: string | null | undefined): ManagedRole {
  return role === "admin" ? "admin" : "user"
}

function toNumberOrNull(value: string): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function humanizeExperimentStatus(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase())
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function initialsFor(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return "?"

  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2)
}

function createDraftId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `draft-${Date.now()}`
}

function splitPreviewLines(value: string | null | undefined): string[] {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

type ImageHealth = {
  status: "ready" | "missing" | "legacy"
  label: string
  description: string
}

function isManagedImageValue(value: string | null | undefined): boolean {
  return Boolean(managedImagePathFor(value))
}

function managedImagePathFor(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    let url: URL
    try {
      url = new URL(trimmed)
    } catch {
      return null
    }

    if (!managedImageHosts.has(url.hostname)) return null
    return managedImagePathFor(url.pathname)
  }

  let pathname = trimmed
  if (pathname.startsWith(managedImageProxyPrefix)) {
    pathname = `/${pathname.slice(managedImageProxyPrefix.length)}`
  }

  if (pathname.startsWith("/tastingswithtay/")) {
    pathname = pathname.slice("/tastingswithtay".length)
  }

  if (!managedImagePrefixes.some((prefix) => pathname.startsWith(prefix))) return null
  if (pathname.includes("..") || pathname.includes("//")) return null

  return pathname
}

function imagePreviewSrcFor(value: string | null | undefined): string | null {
  const managedPath = managedImagePathFor(value)
  if (!managedPath) return null

  return `${managedImageProxyPrefix}${managedPath.slice(1)}`
}

function isLegacyPublicImageValue(value: string | null | undefined): boolean {
  const trimmed = value?.trim()
  if (!trimmed || !trimmed.startsWith("/")) return false
  if (isManagedImageValue(trimmed)) return false

  return /\.(avif|gif|heic|heif|jpe?g|png|svg|webp)([#?].*)?$/i.test(trimmed)
}

function imageHealthFor(value: string | null | undefined): ImageHealth {
  if (isManagedImageValue(value)) {
    return {
      status: "ready",
      label: "Image uploaded",
      description: "This points at RustFS/CDN content.",
    }
  }

  if (isLegacyPublicImageValue(value)) {
    return {
      status: "legacy",
      label: "Replace image",
      description: "This is an old bundled public image path. Upload a real photo.",
    }
  }

  return {
    status: "missing",
    label: "Upload image",
    description: "No managed image is attached yet.",
  }
}

function imageHealthClassName(status: ImageHealth["status"]): string {
  if (status === "ready") return "border-emerald-300 bg-emerald-50 text-emerald-800"
  return "border-destructive/40 bg-destructive/10 text-destructive"
}

function mergeSiteDraft(value: Partial<SiteDraft> | null | undefined): SiteDraft {
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
  }
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function contentTypeForFile(file: File): string {
  if (file.type) return file.type

  const extension = file.name.split(".").at(-1)?.toLowerCase()
  if (extension === "avif") return "image/avif"
  if (extension === "gif") return "image/gif"
  if (extension === "heic") return "image/heic"
  if (extension === "heif") return "image/heif"
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg"
  if (extension === "png") return "image/png"
  if (extension === "webp") return "image/webp"

  return "application/octet-stream"
}

type PreparedImageUpload = {
  blob: Blob
  contentType: string
  fileName: string
}

function isCompressibleImage(file: File): boolean {
  return ["image/avif", "image/jpeg", "image/png", "image/webp"].includes(contentTypeForFile(file))
}

function compressedFileName(fileName: string): string {
  if (/\.[^.]+$/.test(fileName)) return fileName.replace(/\.[^.]+$/, ".jpg")
  return `${fileName}.jpg`
}

async function blobFromCanvas(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", compressedImageQuality)
  })
}

async function compressImageFile(file: File): Promise<PreparedImageUpload | null> {
  if (!isCompressibleImage(file) || typeof createImageBitmap === "undefined") return null

  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, maxImageUploadEdge / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    if (!context) return null

    canvas.width = width
    canvas.height = height
    context.drawImage(bitmap, 0, 0, width, height)

    const blob = await blobFromCanvas(canvas)
    if (!blob || (blob.size >= file.size && file.size <= maxImageUploadBytes)) return null

    return {
      blob,
      contentType: "image/jpeg",
      fileName: compressedFileName(file.name),
    }
  } finally {
    bitmap.close()
  }
}

async function prepareImageUpload(file: File): Promise<PreparedImageUpload> {
  let compressed: PreparedImageUpload | null = null

  try {
    compressed = await compressImageFile(file)
  } catch {
    compressed = null
  }

  if (compressed && compressed.blob.size <= maxImageUploadBytes) return compressed

  if (file.size <= maxImageUploadBytes) {
    return {
      blob: file,
      contentType: contentTypeForFile(file),
      fileName: file.name,
    }
  }

  const sizeLabel = compressed ? formatBytes(compressed.blob.size) : formatBytes(file.size)
  throw new Error(
    `Image is ${sizeLabel}${compressed ? " after compression" : ""}. Please upload an image 10 MB or smaller.`,
  )
}

async function fileToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  const chunkSize = 0x8000
  let binary = ""

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return window.btoa(binary)
}

async function uploadImageFile(file: File, folder: ManagedAssetFolder): Promise<ManagedImageAsset> {
  const prepared = await prepareImageUpload(file)
  const result = await uploadManagedAsset({
    data: {
      folder,
      fileName: prepared.fileName,
      contentType: prepared.contentType,
      bytesBase64: await fileToBase64(prepared.blob),
    },
  })

  if (!result.ok) throw new Error(result.error)

  return result.asset
}

function upsertByUpdatedAt<T extends { id: string; updatedAt?: Date | string }>(
  items: T[],
  nextItem: T,
): T[] {
  return [nextItem, ...items.filter((item) => item.id !== nextItem.id)].sort((left, right) => {
    const leftValue = left.updatedAt ? new Date(left.updatedAt).getTime() : 0
    const rightValue = right.updatedAt ? new Date(right.updatedAt).getTime() : 0
    return rightValue - leftValue
  })
}
